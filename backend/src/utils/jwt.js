import jwt from 'jsonwebtoken';

export const generateToken = (userId, clinicId) => {
  return jwt.sign(
    { userId, clinicId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
