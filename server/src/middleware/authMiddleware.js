import jwt from 'jsonwebtoken';

export default function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing Authorization header' });
    }

    const token = header.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'JWT secret is not configured' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { userId, email, iat, exp }
    req.user = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};