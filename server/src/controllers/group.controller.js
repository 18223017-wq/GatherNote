const prisma = require('../config/database');
const { generateCode } = require('../utils/validator.util');

/**
 * Create new group
 * POST /api/v1/groups
 */
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Group name is required'
      });
    }

    // Generate unique join code
    let join_code;
    let isUnique = false;
    
    while (!isUnique) {
      join_code = generateCode(8);
      const existing = await prisma.group.findUnique({
        where: { join_code }
      });
      if (!existing) isUnique = true;
    }

    // Create group
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description,
        join_code
      }
    });

    // Add creator as admin
    await prisma.groupMember.create({
      data: {
        group_id: group.id,
        user_id: req.user.userId,
        role: 'ADMIN'
      }
    });

    res.status(201).json({
      message: 'Group created successfully',
      group
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create group'
    });
  }
};

/**
 * Get all groups user is a member of
 * GET /api/v1/groups
 */
const getGroups = async (req, res) => {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: {
        user_id: req.user.userId
      },
      include: {
        group: {
          include: {
            _count: {
              select: { members: true }
            }
          }
        }
      },
      orderBy: {
        joined_at: 'desc'
      }
    });

    const groups = memberships.map(m => ({
      ...m.group,
      my_role: m.role,
      joined_at: m.joined_at,
      member_count: m.group._count.members
    }));

    res.json({ groups });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get groups'
    });
  }
};

/**
 * Get group details
 * GET /api/v1/groups/:id
 */
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is member
    const membership = await prisma.groupMember.findFirst({
      where: {
        group_id: parseInt(id),
        user_id: req.user.userId
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this group'
      });
    }

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
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
          orderBy: [
            { role: 'desc' }, // ADMIN first
            { joined_at: 'asc' }
          ]
        }
      }
    });

    if (!group) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Group not found'
      });
    }

    res.json({
      group: {
        ...group,
        my_role: membership.role
      }
    });

  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get group'
    });
  }
};

/**
 * Join group via join code
 * POST /api/v1/groups/join
 */
const joinGroup = async (req, res) => {
  try {
    const { join_code } = req.body;

    if (!join_code) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Join code is required'
      });
    }

    // Find group
    const group = await prisma.group.findUnique({
      where: { join_code: join_code.toUpperCase() }
    });

    if (!group) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Invalid join code'
      });
    }

    // Check if already member
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        group_id: group.id,
        user_id: req.user.userId
      }
    });

    if (existingMember) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You are already a member of this group'
      });
    }

    // Add as member
    const membership = await prisma.groupMember.create({
      data: {
        group_id: group.id,
        user_id: req.user.userId,
        role: 'MEMBER'
      }
    });

    res.status(201).json({
      message: 'Successfully joined group',
      group,
      membership
    });

  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to join group'
    });
  }
};

/**
 * Remove member from group or leave group
 * DELETE /api/v1/groups/:id/members/:userId
 */
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const groupId = parseInt(id);
    const targetUserId = parseInt(userId);
    const currentUserId = req.user.userId;

    // Get current user's membership
    const currentMembership = await prisma.groupMember.findFirst({
      where: {
        group_id: groupId,
        user_id: currentUserId
      }
    });

    if (!currentMembership) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this group'
      });
    }

    // Check permissions
    const isLeavingSelf = currentUserId === targetUserId;
    const isAdmin = currentMembership.role === 'ADMIN';

    if (!isLeavingSelf && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can remove members'
      });
    }

    // Find target membership
    const targetMembership = await prisma.groupMember.findFirst({
      where: {
        group_id: groupId,
        user_id: targetUserId
      }
    });

    if (!targetMembership) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Member not found in this group'
      });
    }

    // Remove member
    await prisma.groupMember.delete({
      where: { id: targetMembership.id }
    });

    res.json({
      message: isLeavingSelf ? 'Successfully left group' : 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to remove member'
    });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  joinGroup,
  removeMember
};
