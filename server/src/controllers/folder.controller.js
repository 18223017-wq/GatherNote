const prisma = require('../config/database');

/**
 * Create new folder
 * POST /api/v1/folders
 */
const createFolder = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Folder name is required'
      });
    }

    const folder = await prisma.folder.create({
      data: {
        owner_id: req.user.userId,
        name: name.trim(),
        description,
        color,
        icon
      }
    });

    res.status(201).json({
      message: 'Folder created successfully',
      folder
    });

  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create folder'
    });
  }
};

/**
 * Get all folders for current user
 * GET /api/v1/folders
 */
const getFolders = async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: {
        owner_id: req.user.userId
      },
      include: {
        _count: {
          select: { notes: true }
        }
      },
      orderBy: [
        { is_pinned: 'desc' },
        { created_at: 'desc' }
      ]
    });

    res.json({ folders });

  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get folders'
    });
  }
};

/**
 * Get folder details with notes
 * GET /api/v1/folders/:id
 */
const getFolderById = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await prisma.folder.findFirst({
      where: {
        id: parseInt(id),
        owner_id: req.user.userId
      },
      include: {
        notes: {
          orderBy: { updated_at: 'desc' }
        }
      }
    });

    if (!folder) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Folder not found'
      });
    }

    res.json({ folder });

  } catch (error) {
    console.error('Get folder error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get folder'
    });
  }
};

/**
 * Update folder
 * PUT /api/v1/folders/:id
 */
const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon, is_pinned } = req.body;

    // Check ownership
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: parseInt(id),
        owner_id: req.user.userId
      }
    });

    if (!existingFolder) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Folder not found'
      });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (is_pinned !== undefined) updateData.is_pinned = is_pinned;

    const folder = await prisma.folder.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      message: 'Folder updated successfully',
      folder
    });

  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update folder'
    });
  }
};

/**
 * Delete folder
 * DELETE /api/v1/folders/:id
 */
const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const folder = await prisma.folder.findFirst({
      where: {
        id: parseInt(id),
        owner_id: req.user.userId
      },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    });

    if (!folder) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Folder not found'
      });
    }

    // Optional: Prevent deletion if folder has notes
    if (folder._count.notes > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Cannot delete folder with notes. Please move or delete notes first.'
      });
    }

    await prisma.folder.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Folder deleted successfully'
    });

  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete folder'
    });
  }
};

module.exports = {
  createFolder,
  getFolders,
  getFolderById,
  updateFolder,
  deleteFolder
};
