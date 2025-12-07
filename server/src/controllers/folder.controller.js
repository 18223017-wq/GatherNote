const db = require('../config/database');
const { folders, notes } = require('../config/schema');
const { eq, and, desc, sql } = require('drizzle-orm');

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

    const [newFolder] = await db.insert(folders).values({
      owner_id: req.user.userId,
      name: name.trim(),
      description,
      color,
      icon
    });

    const [folder] = await db.select().from(folders).where(eq(folders.id, newFolder.insertId));

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
    const foldersList = await db.select({
      id: folders.id,
      owner_id: folders.owner_id,
      name: folders.name,
      description: folders.description,
      color: folders.color,
      icon: folders.icon,
      is_pinned: folders.is_pinned,
      created_at: folders.created_at,
      _count: sql`(SELECT COUNT(*) FROM ${notes} WHERE ${notes.folder_id} = ${folders.id})`
    })
    .from(folders)
    .where(eq(folders.owner_id, req.user.userId))
    .orderBy(desc(folders.is_pinned), desc(folders.created_at));

    res.json({ folders: foldersList });

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

    const [folder] = await db.select().from(folders)
      .where(and(eq(folders.id, parseInt(id)), eq(folders.owner_id, req.user.userId)))
      .limit(1);

    if (!folder) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Folder not found'
      });
    }

    // Get notes for this folder
    const folderNotes = await db.select().from(notes)
      .where(eq(notes.folder_id, parseInt(id)))
      .orderBy(desc(notes.updated_at));

    folder.notes = folderNotes;

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
    const [existingFolder] = await db.select().from(folders)
      .where(and(eq(folders.id, parseInt(id)), eq(folders.owner_id, req.user.userId)))
      .limit(1);

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

    await db.update(folders).set(updateData).where(eq(folders.id, parseInt(id)));

    const [folder] = await db.select().from(folders).where(eq(folders.id, parseInt(id)));

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
    const [folder] = await db.select().from(folders)
      .where(and(eq(folders.id, parseInt(id)), eq(folders.owner_id, req.user.userId)))
      .limit(1);

    if (!folder) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Folder not found'
      });
    }

    // Count notes in folder
    const [noteCount] = await db.select({ count: sql`COUNT(*)` }).from(notes).where(eq(notes.folder_id, parseInt(id)));

    // Optional: Prevent deletion if folder has notes
    if (noteCount.count > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Cannot delete folder with notes. Please move or delete notes first.'
      });
    }

    await db.delete(folders).where(eq(folders.id, parseInt(id)));

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
