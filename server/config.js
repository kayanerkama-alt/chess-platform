const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const TOKEN_EXPIRY = '7d';

module.exports = { JWT_SECRET, TOKEN_EXPIRY };
