import { Profile, UserSettings } from '../models.js';
import { serializeDoc, userId } from '../utils/request.js';
export async function getProfile(req, res) {
  const profile = await Profile.findOneAndUpdate({ user_id: userId(req) }, { $setOnInsert: { user_id: userId(req), name: req.user.name, email: req.user.email } }, { new: true, upsert: true });
  const result = serializeDoc(profile); result.id = String(req.user._id); res.json(result);
}
export async function updateProfile(req, res) {
  const name = req.body?.name;
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) return res.status(400).json({ message: 'Name must be between 2 and 100 characters.' });
  req.user.name = name.trim(); await req.user.save();
  const profile = await Profile.findOneAndUpdate({ user_id: userId(req) }, { $set: { name: req.user.name }, $setOnInsert: { user_id: userId(req), email: req.user.email } }, { new: true, upsert: true });
  const result = serializeDoc(profile); result.id = String(req.user._id); res.json(result);
}
export async function getSettings(req, res) {
  const settings = await UserSettings.findOneAndUpdate({ user_id: userId(req) }, { $setOnInsert: { user_id: userId(req) } }, { new: true, upsert: true });
  res.json(serializeDoc(settings));
}
export async function updateSettings(req, res) {
  const allowed = ['currency', 'tariff', 'dark_mode', 'notifications', 'monthly_budget'];
  const patch = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
  const settings = await UserSettings.findOneAndUpdate({ user_id: userId(req) }, { $set: patch, $setOnInsert: { user_id: userId(req) } }, { new: true, upsert: true, runValidators: true });
  res.json(serializeDoc(settings));
}
