const db = require('../config/database');
const { notes, users, folders } = require('../config/schema');
const { eq, and, desc, asc, sql } = require('drizzle-orm');

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

    const [newNote] = await db.insert(notes).values(noteData);
    
    // Get note with relations
    const [note] = await db.select({
      id: notes.id,
      owner_id: notes.owner_id,
      folder_id: notes.folder_id,
      title: notes.title,
      content: notes.content,
      status: notes.status,
      priority: notes.priority,
      progress: notes.progress,
      is_favorite: notes.is_favorite,
      visibility: notes.visibility,
      created_at: notes.created_at,
      updated_at: notes.updated_at,
      owner: {
        id: users.id,
        name: users.name,
        avatar_url: users.avatar_url
      },
      folder: {
        id: folders.id,
        name: folders.name,
        color: folders.color
      }
    })
    .from(notes)
    .leftJoin(users, eq(notes.owner_id, users.id))
    .leftJoin(folders, eq(notes.folder_id, folders.id))
    .where(eq(notes.id, newNote.insertId));

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

    // Build where conditions
    const conditions = [eq(notes.owner_id, req.user.userId)];

    if (status) {
      conditions.push(eq(notes.status, status.toUpperCase()));
    }

    if (folder_id) {
      conditions.push(eq(notes.folder_id, parseInt(folder_id)));
    }

    // Build orderBy
    let orderByClause = [desc(notes.updated_at)]; // default
    if (sort === 'newest') {
      orderByClause = [desc(notes.created_at)];
    } else if (sort === 'oldest') {
      orderByClause = [asc(notes.created_at)];
    } else if (sort === 'title') {
      orderByClause = [asc(notes.title)];
    }

    const notesList = await db.select({
      id: notes.id,
      owner_id: notes.owner_id,
      folder_id: notes.folder_id,
      title: notes.title,
      content: notes.content,
      status: notes.status,
      priority: notes.priority,
      progress: notes.progress,
      is_favorite: notes.is_favorite,
      visibility: notes.visibility,
      created_at: notes.created_at,
      updated_at: notes.updated_at,
      folder: sql`JSON_OBJECT('id', ${folders.id}, 'name', ${folders.name}, 'color', ${folders.color})`
    })
    .from(notes)
    .leftJoin(folders, eq(notes.folder_id, folders.id))
    .where(and(...conditions))
    .orderBy(desc(notes.is_favorite), ...orderByClause);

    res.json({ notes: notesList });

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

    const [note] = await db.select({
      id: notes.id,
      owner_id: notes.owner_id,
      folder_id: notes.folder_id,
      title: notes.title,
      content: notes.content,
      status: notes.status,
      priority: notes.priority,
      progress: notes.progress,
      is_favorite: notes.is_favorite,
      visibility: notes.visibility,
      created_at: notes.created_at,
      updated_at: notes.updated_at,
      owner: sql`JSON_OBJECT('id', ${users.id}, 'name', ${users.name}, 'avatar_url', ${users.avatar_url})`,
      folder: sql`JSON_OBJECT('id', ${folders.id}, 'name', ${folders.name}, 'color', ${folders.color}, 'icon', ${folders.icon})`
    })
    .from(notes)
    .leftJoin(users, eq(notes.owner_id, users.id))
    .leftJoin(folders, eq(notes.folder_id, folders.id))
    .where(and(eq(notes.id, parseInt(id)), eq(notes.owner_id, req.user.userId)))
    .limit(1);

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
    const [existingNote] = await db.select()
      .from(notes)
      .where(and(eq(notes.id, parseInt(id)), eq(notes.owner_id, req.user.userId)))
      .limit(1);

    if (!existingNote) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found'
      });
    }

    const updateData = { updated_at: new Date() };
    if (title) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (status) updateData.status = status.toUpperCase();
    if (priority !== undefined) updateData.priority = priority;
    if (progress !== undefined) updateData.progress = parseInt(progress);

    await db.update(notes)
      .set(updateData)
      .where(eq(notes.id, parseInt(id)));

    // Get updated note with relations
    const [note] = await db.select({
      id: notes.id,
      owner_id: notes.owner_id,
      folder_id: notes.folder_id,
      title: notes.title,
      content: notes.content,
      status: notes.status,
      priority: notes.priority,
      progress: notes.progress,
      is_favorite: notes.is_favorite,
      visibility: notes.visibility,
      created_at: notes.created_at,
      updated_at: notes.updated_at,
      folder: sql`JSON_OBJECT('id', ${folders.id}, 'name', ${folders.name}, 'color', ${folders.color})`
    })
    .from(notes)
    .leftJoin(folders, eq(notes.folder_id, folders.id))
    .where(eq(notes.id, parseInt(id)));

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
    const [note] = await db.select()
      .from(notes)
      .where(and(eq(notes.id, parseInt(id)), eq(notes.owner_id, req.user.userId)))
      .limit(1);

    if (!note) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found'
      });
    }

    await db.delete(notes).where(eq(notes.id, parseInt(id)));

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
    const [existingNote] = await db.select()
      .from(notes)
      .where(and(eq(notes.id, parseInt(id)), eq(notes.owner_id, req.user.userId)))
      .limit(1);

    if (!existingNote) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found'
      });
    }

    await db.update(notes)
      .set({ 
        is_favorite: !existingNote.is_favorite,
        updated_at: new Date()
      })
      .where(eq(notes.id, parseInt(id)));

    const [note] = await db.select().from(notes).where(eq(notes.id, parseInt(id)));

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
    const [existingNote] = await db.select()
      .from(notes)
      .where(and(eq(notes.id, parseInt(id)), eq(notes.owner_id, req.user.userId)))
      .limit(1);

    if (!existingNote) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found'
      });
    }

    // If moving to a folder, verify folder ownership
    if (folder_id) {
      const [folder] = await db.select()
        .from(folders)
        .where(and(eq(folders.id, parseInt(folder_id)), eq(folders.owner_id, req.user.userId)))
        .limit(1);

      if (!folder) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Folder not found'
        });
      }
    }

    const updateData = { updated_at: new Date() };
    if (folder_id !== undefined) {
      updateData.folder_id = folder_id ? parseInt(folder_id) : null;
    }
    if (status) {
      updateData.status = status.toUpperCase();
    }

    await db.update(notes)
      .set(updateData)
      .where(eq(notes.id, parseInt(id)));

    // Get updated note with relations
    const [note] = await db.select({
      id: notes.id,
      owner_id: notes.owner_id,
      folder_id: notes.folder_id,
      title: notes.title,
      content: notes.content,
      status: notes.status,
      priority: notes.priority,
      progress: notes.progress,
      is_favorite: notes.is_favorite,
      visibility: notes.visibility,
      created_at: notes.created_at,
      updated_at: notes.updated_at,
      folder: sql`JSON_OBJECT('id', ${folders.id}, 'name', ${folders.name}, 'color', ${folders.color})`
    })
    .from(notes)
    .leftJoin(folders, eq(notes.folder_id, folders.id))
    .where(eq(notes.id, parseInt(id)));

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
