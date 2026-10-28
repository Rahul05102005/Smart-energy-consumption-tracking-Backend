import { Appliance, ApplianceUsageHistory, EnergyChallenge } from '../models.js';
import { serializeDoc, userId, validSchedule } from '../utils/request.js';
export async function listAppliances(req, res) {
  res.json((await Appliance.find({ user_id: userId(req) }).sort({ created_at: -1 })).map(serializeDoc));
}
export async function createAppliance(req, res) {
  const body = { ...req.body, user_id: userId(req) }; delete body.id; delete body._id;
  if (body.usage_mode === 'schedule' && !validSchedule(body.schedule)) return res.status(400).json({ message: 'Enter a valid usage schedule.' });
  res.status(201).json(serializeDoc(await Appliance.create(body)));
}
export async function updateAppliance(req, res) {
  const patch = { ...req.body }; delete patch.id; delete patch._id; delete patch.user_id;
  if (patch.usage_mode === 'schedule' && !validSchedule(patch.schedule)) return res.status(400).json({ message: 'Enter a valid usage schedule.' });
  const appliance = await Appliance.findOne({ _id: req.params.id, user_id: userId(req) });
  if (!appliance) return res.status(404).json({ message: 'Appliance not found.' });
  const tracked = ['power_rating', 'daily_usage_hours', 'quantity', 'usage_mode', 'schedule'];
  const changed = tracked.some((key) => JSON.stringify(appliance[key]) !== JSON.stringify(Object.hasOwn(patch, key) ? patch[key] : appliance[key]));
  if (changed) await ApplianceUsageHistory.create({ user_id: userId(req), appliance_id: appliance._id, power_rating: appliance.power_rating, daily_usage_hours: appliance.daily_usage_hours, quantity: appliance.quantity, usage_mode: appliance.usage_mode, schedule: appliance.schedule });
  Object.assign(appliance, patch); await appliance.save(); res.json(serializeDoc(appliance));
}
export async function deleteAppliance(req, res) {
  const appliance = await Appliance.findOneAndDelete({ _id: req.params.id, user_id: userId(req) });
  if (!appliance) return res.status(404).json({ message: 'Appliance not found.' });
  await Promise.all([ApplianceUsageHistory.deleteMany({ appliance_id: appliance._id, user_id: userId(req) }), EnergyChallenge.deleteMany({ appliance_id: appliance._id, user_id: userId(req) })]);
  res.status(204).end();
}
export async function listUsageHistory(req, res) {
  res.json((await ApplianceUsageHistory.find({ user_id: userId(req) }).sort({ captured_at: -1 }).limit(500)).map(serializeDoc));
}
