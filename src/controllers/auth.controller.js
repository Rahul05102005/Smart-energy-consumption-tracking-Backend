import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { User, Profile, UserSettings, safeUser } from '../models.js';
import { signToken, verifyReset } from '../auth.js';

export async function register(req, res) {
  const { name, email, password } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 8 || password.length > 72) return res.status(400).json({ message: 'Enter a valid name, email, and password (8–72 characters).' });
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ message: 'Password must include uppercase, lowercase, and a number.' });
  const normalized = email.trim().toLowerCase();
  if (await User.exists({ email: normalized })) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = await User.create({ name: name.trim(), email: normalized, password_hash: await bcrypt.hash(password, 12) });
  await Promise.all([UserSettings.create({ user_id: user._id }), Profile.create({ user_id: user._id, name: user.name, email: user.email })]);
  res.status(201).json({ token: signToken(user), user: safeUser(user) });
}

export async function login(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(String(req.body?.password || ''), user.password_hash)) return res.status(401).json({ message: 'Incorrect email or password.' });
  res.json({ token: signToken(user), user: safeUser(user) });
}

export function currentUser(req, res) { res.json({ user: safeUser(req.user) }); }

export async function forgotPassword(req, res) {
  const user = await User.findOne({ email: String(req.body?.email || '').trim().toLowerCase() });
  if (user) {
    const token = signToken(user, 'reset');
    const url = new URL('/reset-password', (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0]);
    url.searchParams.set('token', token);
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
      await transporter.sendMail({ from: process.env.SMTP_FROM, to: user.email, subject: 'Reset your EnergyTrack password', text: `Use this link to reset your password: ${url}`, html: `<p><a href="${url}">Reset your EnergyTrack password</a></p><p>This link expires in ${process.env.RESET_TOKEN_EXPIRES_MINUTES || 30} minutes.</p>` });
    } else if (process.env.NODE_ENV !== 'production') console.info(`Password reset URL for ${user.email}: ${url}`);
  }
  res.json({ message: 'If an account exists, a reset link has been created.' });
}

export async function resetPassword(req, res) {
  const userId = verifyReset(req.body?.token); const password = req.body?.password;
  if (typeof password !== 'string' || password.length < 8 || password.length > 72 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ message: 'Password must be 8–72 characters and include uppercase, lowercase, and a number.' });
  const user = await User.findByIdAndUpdate(userId, { password_hash: await bcrypt.hash(password, 12) }, { new: true });
  res.json({ token: signToken(user), user: safeUser(user) });
}

export async function changePassword(req, res) {
  const password = req.body?.password;
  if (typeof password !== 'string' || password.length < 8 || password.length > 72 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ message: 'Password must be 8–72 characters and include uppercase, lowercase, and a number.' });
  req.user.password_hash = await bcrypt.hash(password, 12); await req.user.save(); res.json({ message: 'Password updated.' });
}
