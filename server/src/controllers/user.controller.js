const db = require('../config/database');
const { users } = require('../config/schema');
const { hashPassword } = require('../utils/password.util');
const { eq } = require('drizzle-orm');

/**
 * Get current user profile
 * GET /api/v1/users/me
 */
const getProfile = async (req, res) => {
  try {
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar_url: users.avatar_url,
      created_at: users.created_at
    }).from(users).where(eq(users.id, req.user.userId)).limit(1);

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get user profile'
    });
  }
};

/**
 * Update user profile
 * PUT /api/v1/users/me
 */
const updateProfile = async (req, res) => {
  try {
    const { name, avatar_url, bio } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    // Note: bio field not in current schema, but kept for future use

    await db.update(users).set(updateData).where(eq(users.id, req.user.userId));

    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar_url: users.avatar_url,
      created_at: users.created_at
    }).from(users).where(eq(users.id, req.user.userId));

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update profile'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
