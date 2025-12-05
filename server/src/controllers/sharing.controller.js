const prisma = require('../config/database');
const { isValidEmail } = require('../utils/validator.util');

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
    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        owner_id: req.user.userId
      }
    });

    if (!note) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found or you do not have permission'
      });
    }

    // Update visibility
    const updatedNote = await prisma.note.update({
      where: { id: parseInt(id) },
      data: {
        visibility: visibility.toUpperCase()
      }
    });

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
    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        owner_id: req.user.userId
      }
    });

    if (!note) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found or you do not have permission'
      });
    }

    // Find user by email
    const collaboratorUser = await prisma.user.findUnique({
      where: { email }
    });

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
    const existing = await prisma.noteCollaborator.findUnique({
      where: {
        note_id_user_id: {
          note_id: parseInt(id),
          user_id: collaboratorUser.id
        }
      }
    });

    if (existing) {
      // Update permission if already exists
      const updated = await prisma.noteCollaborator.update({
        where: { id: existing.id },
        data: { permission: perm },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true
            }
          }
        }
      });

      return res.json({
        message: 'Collaborator permission updated',
        collaborator: updated
      });
    }

    // Add new collaborator
    const collaborator = await prisma.noteCollaborator.create({
      data: {
        note_id: parseInt(id),
        user_id: collaboratorUser.id,
        permission: perm
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true
          }
        }
      }
    });

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
    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { owner_id: req.user.userId },
          {
            collaborators: {
              some: {
                user_id: req.user.userId
              }
            }
          }
        ]
      }
    });

    if (!note) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found or you do not have access'
      });
    }

    // Get collaborators
    const collaborators = await prisma.noteCollaborator.findMany({
      where: {
        note_id: parseInt(id)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true
          }
        }
      },
      orderBy: {
        added_at: 'asc'
      }
    });

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
    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        owner_id: req.user.userId
      }
    });

    if (!note) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Note not found or you do not have permission'
      });
    }

    // Find and delete collaborator
    const collaborator = await prisma.noteCollaborator.findFirst({
      where: {
        note_id: parseInt(id),
        user_id: parseInt(collaboratorId)
      }
    });

    if (!collaborator) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Collaborator not found'
      });
    }

    await prisma.noteCollaborator.delete({
      where: { id: collaborator.id }
    });

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
