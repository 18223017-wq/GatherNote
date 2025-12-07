const db = require('../config/database');
const { notes, users, noteCollaborators } = require('../config/schema');
const { isValidEmail } = require('../utils/validator.util');
const { eq, and, or, sql } = require('drizzle-orm');

/**
 * Set note visibility
 * POST /api/v1/notes/:id/share
 */
const setVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;

    // Validate visibility
    const validVisibilities = ['PRIVATE', 'PUBLIC', 'GROUP'];
    if (!visibility || !validVisibilities.includes(visibility.toUpperCase())) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Valid visibility values are: private, public, group'
      });
    }

    // Check ownership
    const [note] = await db.select()
      .from(notes)
      .where(and(eq(notes.id, parseInt(id)), eq(notes.owner_id, req.user.userId)))
      .limit(1);

    if (!note) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found or you do not have permission'
      });
    }

    // Update visibility
    await db.update(notes)
      .set({ visibility: visibility.toUpperCase(), updated_at: new Date() })
      .where(eq(notes.id, parseInt(id)));

    const [updatedNote] = await db.select().from(notes).where(eq(notes.id, parseInt(id)));

    res.json({
      message: `Note visibility set to ${visibility.toLowerCase()}`,
      note: updatedNote
    });

  } catch (error) {
    console.error('Set visibility error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to set note visibility'
    });
  }
};

/**
 * Add collaborator to note
 * POST /api/v1/notes/:id/collaborators
 */
const addCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, permission } = req.body;

    // Validate input
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Valid email is required'
      });
    }

    const validPermissions = ['VIEW', 'EDIT'];
    const perm = permission ? permission.toUpperCase() : 'VIEW';
    if (!validPermissions.includes(perm)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Valid permission values are: view, edit'
      });
    }

    // Check note ownership
    const [note] = await db.select()
      .from(notes)
      .where(and(eq(notes.id, parseInt(id)), eq(notes.owner_id, req.user.userId)))
      .limit(1);

    if (!note) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found or you do not have permission'
      });
    }

    // Find user by email
    const [collaboratorUser] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!collaboratorUser) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User with this email not found'
      });
    }

    // Don't allow owner to be added as collaborator
    if (collaboratorUser.id === req.user.userId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Cannot add yourself as collaborator'
      });
    }

    // Check if already collaborator
    const [existing] = await db.select()
      .from(noteCollaborators)
      .where(and(eq(noteCollaborators.note_id, parseInt(id)), eq(noteCollaborators.user_id, collaboratorUser.id)))
      .limit(1);

    if (existing) {
      // Update permission if already exists
      await db.update(noteCollaborators)
        .set({ permission: perm })
        .where(eq(noteCollaborators.id, existing.id));

      const [updated] = await db.select({
        id: noteCollaborators.id,
        note_id: noteCollaborators.note_id,
        user_id: noteCollaborators.user_id,
        permission: noteCollaborators.permission,
        added_at: noteCollaborators.added_at,
        user: sql`JSON_OBJECT('id', ${users.id}, 'name', ${users.name}, 'email', ${users.email}, 'avatar_url', ${users.avatar_url})`
      })
      .from(noteCollaborators)
      .leftJoin(users, eq(noteCollaborators.user_id, users.id))
      .where(eq(noteCollaborators.id, existing.id));

      return res.json({
        message: 'Collaborator permission updated',
        collaborator: updated
      });
    }

    // Add new collaborator
    const [newCollab] = await db.insert(noteCollaborators).values({
      note_id: parseInt(id),
      user_id: collaboratorUser.id,
      permission: perm
    });

    const [collaborator] = await db.select({
      id: noteCollaborators.id,
      note_id: noteCollaborators.note_id,
      user_id: noteCollaborators.user_id,
      permission: noteCollaborators.permission,
      added_at: noteCollaborators.added_at,
      user: sql`JSON_OBJECT('id', ${users.id}, 'name', ${users.name}, 'email', ${users.email}, 'avatar_url', ${users.avatar_url})`
    })
    .from(noteCollaborators)
    .leftJoin(users, eq(noteCollaborators.user_id, users.id))
    .where(eq(noteCollaborators.id, newCollab.insertId));

    res.status(201).json({
      message: 'Collaborator added successfully',
      collaborator
    });

  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to add collaborator'
    });
  }
};

/**
 * Get note collaborators
 * GET /api/v1/notes/:id/collaborators
 */
const getCollaborators = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access (owner or collaborator)
    const [noteOwned] = await db.select()
      .from(notes)
      .where(and(eq(notes.id, parseInt(id)), eq(notes.owner_id, req.user.userId)))
      .limit(1);

    const [noteCollab] = await db.select()
      .from(noteCollaborators)
      .where(and(eq(noteCollaborators.note_id, parseInt(id)), eq(noteCollaborators.user_id, req.user.userId)))
      .limit(1);

    if (!noteOwned && !noteCollab) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found or you do not have access'
      });
    }

    // Get collaborators
    const collaborators = await db.select({
      id: noteCollaborators.id,
      note_id: noteCollaborators.note_id,
      user_id: noteCollaborators.user_id,
      permission: noteCollaborators.permission,
      added_at: noteCollaborators.added_at,
      user: sql`JSON_OBJECT('id', ${users.id}, 'name', ${users.name}, 'email', ${users.email}, 'avatar_url', ${users.avatar_url})`
    })
    .from(noteCollaborators)
    .leftJoin(users, eq(noteCollaborators.user_id, users.id))
    .where(eq(noteCollaborators.note_id, parseInt(id)))
    .orderBy(noteCollaborators.added_at);

    res.json({ collaborators });

  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get collaborators'
    });
  }
};

/**
 * Remove collaborator from note
 * DELETE /api/v1/notes/:id/collaborators/:collaboratorId
 */
const removeCollaborator = async (req, res) => {
  try {
    const { id, collaboratorId } = req.params;

    // Check note ownership
    const [note] = await db.select()
      .from(notes)
      .where(and(eq(notes.id, parseInt(id)), eq(notes.owner_id, req.user.userId)))
      .limit(1);

    if (!note) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found or you do not have permission'
      });
    }

    // Find and delete collaborator
    const [collaborator] = await db.select()
      .from(noteCollaborators)
      .where(and(eq(noteCollaborators.note_id, parseInt(id)), eq(noteCollaborators.user_id, parseInt(collaboratorId))))
      .limit(1);

    if (!collaborator) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Collaborator not found'
      });
    }

    await db.delete(noteCollaborators).where(eq(noteCollaborators.id, collaborator.id));

    res.json({
      message: 'Collaborator removed successfully'
    });

  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to remove collaborator'
    });
  }
};

module.exports = {
  setVisibility,
  addCollaborator,
  getCollaborators,
  removeCollaborator
};
