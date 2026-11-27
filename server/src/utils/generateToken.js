const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medibridge_production_secret_key_hackathon_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'medibridge_refresh_secret_key_hackathon_2026';

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

module.exports = { generateAccessToken, generateRefreshToken };
