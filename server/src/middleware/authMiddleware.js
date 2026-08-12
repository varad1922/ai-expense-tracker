import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication middleware.
 * Reads the JWT from the Authorization header, verifies it using the
 * JWT_SECRET environment variable, and attaches the resolved user to req.user.
 *
 * Environment variables required:
 *   JWT_SECRET — must be set in .env (see .env.example). The app refuses to
 *   accept an insecure fallback value in any environment.
 */
export const protect = async (req, res, next) => {
  // Fail-fast if the secret was never configured — catches misconfigured deploys
  // immediately rather than silently minting insecure tokens.
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('[authMiddleware] JWT_SECRET is not set. Refusing to process authenticated requests.');
    res.status(500);
    throw new Error('Server misconfiguration: JWT_SECRET is not defined');
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, jwtSecret);

      // Attach user document to request (without password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User belonging to this token no longer exists');
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token invalid');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};
