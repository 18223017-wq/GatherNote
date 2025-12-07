const db = require('../config/database');
const { groups, groupMembers, users } = require('../config/schema');
const { generateCode } = require('../utils/validator.util');
const { eq, and, desc, asc, sql } = require('drizzle-orm');

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
      const existing = await db.select().from(groups).where(eq(groups.join_code, join_code)).limit(1);
      if (existing.length === 0) isUnique = true;
    }

    // Create group
    const [newGroup] = await db.insert(groups).values({
      name: name.trim(),
      description,
      join_code
    });

    const [group] = await db.select().from(groups).where(eq(groups.id, newGroup.insertId));

    // Add creator as admin
    await db.insert(groupMembers).values({
      group_id: group.id,
      user_id: req.user.userId,
      role: 'ADMIN'
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
    const memberships = await db.select({
      group_id: groupMembers.group_id,
      user_id: groupMembers.user_id,
      role: groupMembers.role,
      joined_at: groupMembers.joined_at,
      group: sql`JSON_OBJECT('id', ${groups.id}, 'name', ${groups.name}, 'description', ${groups.description}, 'join_code', ${groups.join_code}, 'created_at', ${groups.created_at}, 'member_count', (SELECT COUNT(*) FROM ${groupMembers} gm WHERE gm.group_id = ${groups.id}))`
    })
    .from(groupMembers)
    .leftJoin(groups, eq(groupMembers.group_id, groups.id))
    .where(eq(groupMembers.user_id, req.user.userId))
    .orderBy(desc(groupMembers.joined_at));

    const groupsList = memberships.map(m => ({
      ...m.group,
      my_role: m.role,
      joined_at: m.joined_at
    }));

    res.json({ groups: groupsList });

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
    const [membership] = await db.select()
      .from(groupMembers)
      .where(and(eq(groupMembers.group_id, parseInt(id)), eq(groupMembers.user_id, req.user.userId)))
      .limit(1);

    if (!membership) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this group'
      });
    }

    const [group] = await db.select().from(groups).where(eq(groups.id, parseInt(id))).limit(1);

    if (!group) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Group not found'
      });
    }

    // Get members
    const members = await db.select({
      id: groupMembers.id,
      group_id: groupMembers.group_id,
      user_id: groupMembers.user_id,
      role: groupMembers.role,
      joined_at: groupMembers.joined_at,
      user: sql`JSON_OBJECT('id', ${users.id}, 'name', ${users.name}, 'email', ${users.email}, 'avatar_url', ${users.avatar_url})`
    })
    .from(groupMembers)
    .leftJoin(users, eq(groupMembers.user_id, users.id))
    .where(eq(groupMembers.group_id, parseInt(id)))
    .orderBy(desc(groupMembers.role), asc(groupMembers.joined_at));

    group.members = members;

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
    const [group] = await db.select()
      .from(groups)
      .where(eq(groups.join_code, join_code.toUpperCase()))
      .limit(1);

    if (!group) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Invalid join code'
      });
    }

    // Check if already member
    const [existingMember] = await db.select()
      .from(groupMembers)
      .where(and(eq(groupMembers.group_id, group.id), eq(groupMembers.user_id, req.user.userId)))
      .limit(1);

    if (existingMember) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You are already a member of this group'
      });
    }

    // Add as member
    const [newMember] = await db.insert(groupMembers).values({
      group_id: group.id,
      user_id: req.user.userId,
      role: 'MEMBER'
    });

    const [membership] = await db.select().from(groupMembers).where(eq(groupMembers.id, newMember.insertId));

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
    const [currentMembership] = await db.select()
      .from(groupMembers)
      .where(and(eq(groupMembers.group_id, groupId), eq(groupMembers.user_id, currentUserId)))
      .limit(1);

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
    const [targetMembership] = await db.select()
      .from(groupMembers)
      .where(and(eq(groupMembers.group_id, groupId), eq(groupMembers.user_id, targetUserId)))
      .limit(1);

    if (!targetMembership) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Member not found in this group'
      });
    }

    // Remove member
    await db.delete(groupMembers).where(eq(groupMembers.id, targetMembership.id));

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
