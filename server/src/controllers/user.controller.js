const prisma = require('../config/database');
const { hashPassword } = require('../utils/password.util');

/**
 * Get current user profile
 * GET /api/v1/users/me
 */
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        created_at: true
      }
    });

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

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        created_at: true
      }
    });

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
