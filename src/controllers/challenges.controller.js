import { Appliance, EnergyChallenge } from '../models.js';
import { serializeDoc, userId } from '../utils/request.js';
export async function listChallenges(req, res) {
  res.json((await EnergyChallenge.find({ user_id: userId(req) }).sort({ created_at: -1 })).map(serializeDoc));
}
export async function createChallenge(req, res) {
  const challenge = { ...req.body, user_id: userId(req) }; delete challenge.id; delete challenge._id;
  if (challenge.appliance_id && !await Appliance.exists({ _id: challenge.appliance_id, user_id: userId(req) })) return res.status(400).json({ message: 'Choose one of your appliances.' });
  if (challenge.end_date < challenge.start_date || (challenge.challenge_type === 'reduce_energy_percent' && (challenge.target_value > 100 || challenge.appliance_id)) || (challenge.challenge_type === 'reduce_appliance_hours' && (challenge.target_value > 24 || !challenge.appliance_id))) return res.status(400).json({ message: 'Challenge details are invalid.' });
  res.status(201).json(serializeDoc(await EnergyChallenge.create(challenge)));
}
export async function completeChallenge(req, res) {
  const challenge = await EnergyChallenge.findOneAndUpdate({ _id: req.params.id, user_id: userId(req) }, { $set: { completed_at: req.body?.completed_at || new Date() } }, { new: true });
  if (!challenge) return res.status(404).json({ message: 'Challenge not found.' }); res.json(serializeDoc(challenge));
}
export async function deleteChallenge(req, res) {
  const challenge = await EnergyChallenge.findOneAndDelete({ _id: req.params.id, user_id: userId(req) });
  if (!challenge) return res.status(404).json({ message: 'Challenge not found.' }); res.status(204).end();
}
