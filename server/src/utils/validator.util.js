/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength (min 6 characters)
 * @param {String} password - Password to validate
 * @returns {Boolean} True if valid password
 */
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Generate random alphanumeric code
 * @param {Number} length - Length of code
 * @returns {String} Random code
 */
const generateCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  generateCode
};
