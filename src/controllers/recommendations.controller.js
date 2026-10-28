import { Recommendation } from '../models.js';
import { serializeDoc, userId } from '../utils/request.js';
export async function listRecommendations(req, res) {
  res.json((await Recommendation.find({ user_id: userId(req) }).sort({ created_at: -1 })).map(serializeDoc));
}
export async function syncRecommendations(req, res) {
  const tips = Array.isArray(req.body?.recommendations) ? req.body.recommendations : [];
  const recommendations = tips.filter((tip) => typeof tip.message === 'string' && tip.message.trim()).map((tip) => ({ user_id: userId(req), message: tip.message.trim(), priority: ['low', 'medium', 'high'].includes(tip.priority) ? tip.priority : 'medium' }));
  await Recommendation.deleteMany({ user_id: userId(req) });
  if (recommendations.length) await Recommendation.insertMany(recommendations);
  res.json({ saved: recommendations.length });
}
