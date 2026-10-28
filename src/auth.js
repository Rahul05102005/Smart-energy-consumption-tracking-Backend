import jwt from 'jsonwebtoken';
import { User } from './models.js';
export function signToken(user, purpose = 'access') { return jwt.sign({ sub: String(user._id), purpose }, process.env.JWT_SECRET, { expiresIn: purpose === 'reset' ? `${process.env.RESET_TOKEN_EXPIRES_MINUTES || 30}m` : (process.env.JWT_EXPIRES_IN || '7d') }); }
export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== 'access') return res.status(401).json({ message: 'Invalid session.' });
    req.user = await User.findById(payload.sub);
    if (!req.user) return res.status(401).json({ message: 'Account no longer exists.' });
    next();
  } catch { res.status(401).json({ message: 'Session expired. Sign in again.' }); }
}
export function verifyReset(token) { const p = jwt.verify(token, process.env.JWT_SECRET); if (p.purpose !== 'reset') throw new Error('Invalid reset token'); return p.sub; }
