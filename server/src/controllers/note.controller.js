const prisma = require('../config/database');

/**
 * Create new note
 * POST /api/v1/notes
 */
const createNote = async (req, res) => {
  try {
    const { title, content, folder_id, status, priority } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Note title is required'
      });
    }

    const noteData = {
      owner_id: req.user.userId,
      title: title.trim(),
      content: content || '',
      status: status || 'UNSTARTED'
    };

    if (folder_id) noteData.folder_id = parseInt(folder_id);
    if (priority) noteData.priority = priority;

    const note = await prisma.note.create({
      data: noteData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Note created successfully',
      note
    });

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create note'
    });
  }
};

/**
 * Get all notes for current user
 * GET /api/v1/notes?sort=newest&status=ongoing
 */
const getNotes = async (req, res) => {
  try {
    const { sort, status, folder_id } = req.query;

    // Build where clause
    const whereClause = {
      owner_id: req.user.userId
    };

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (folder_id) {
      whereClause.folder_id = parseInt(folder_id);
    }

    // Build orderBy
    let orderBy = { updated_at: 'desc' }; // default
    if (sort === 'newest') {
      orderBy = { created_at: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'title') {
      orderBy = { title: 'asc' };
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: [
        { is_favorite: 'desc' },
        orderBy
      ]
    });

    res.json({ notes });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get notes'
    });
  }
};

/**
 * Get note by ID
 * GET /api/v1/notes/:id
 */
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        owner_id: req.user.userId
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      }
    });

    if (!note) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found'
      });
    }

    res.json({ note });

  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get note'
    });
  }
};

/**
 * Update note
 * PUT /api/v1/notes/:id
 */
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status, priority, progress } = req.body;

    // Check ownership
    const existingNote = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        owner_id: req.user.userId
      }
    });

    if (!existingNote) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found'
      });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (status) updateData.status = status.toUpperCase();
    if (priority !== undefined) updateData.priority = priority;
    if (progress !== undefined) updateData.progress = parseInt(progress);

    const note = await prisma.note.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    res.json({
      message: 'Note updated successfully',
      note
    });

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update note'
    });
  }
};

/**
 * Delete note
 * DELETE /api/v1/notes/:id
 */
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        owner_id: req.user.userId
      }
    });

    if (!note) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found'
      });
    }

    await prisma.note.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete note'
    });
  }
};

/**
 * Toggle favorite/pin status
 * PATCH /api/v1/notes/:id/pin
 */
const togglePin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const existingNote = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        owner_id: req.user.userId
      }
    });

    if (!existingNote) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found'
      });
    }

    const note = await prisma.note.update({
      where: { id: parseInt(id) },
      data: {
        is_favorite: !existingNote.is_favorite
      }
    });

    res.json({
      message: note.is_favorite ? 'Note pinned' : 'Note unpinned',
      note
    });

  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to toggle pin'
    });
  }
};

/**
 * Move note to another folder
 * PATCH /api/v1/notes/:id/move
 */
const moveNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { folder_id, status } = req.body;

    // Check ownership
    const existingNote = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        owner_id: req.user.userId
      }
    });

    if (!existingNote) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found'
      });
    }

    // If moving to a folder, verify folder ownership
    if (folder_id) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: parseInt(folder_id),
          owner_id: req.user.userId
        }
      });

      if (!folder) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Folder not found'
        });
      }
    }

    const updateData = {};
    if (folder_id !== undefined) {
      updateData.folder_id = folder_id ? parseInt(folder_id) : null;
    }
    if (status) {
      updateData.status = status.toUpperCase();
    }

    const note = await prisma.note.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    res.json({
      message: 'Note moved successfully',
      note
    });

  } catch (error) {
    console.error('Move note error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to move note'
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  togglePin,
  moveNote
};
