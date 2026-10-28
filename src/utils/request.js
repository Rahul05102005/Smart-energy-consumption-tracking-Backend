import { serialize } from '../models.js';
export const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
export const userId = (req) => req.user._id;
export const serializeDoc = (doc) => doc ? serialize(doc) : null;
export function validSchedule(value) {
  return value && ['daily', 'weekdays', 'weekends', 'custom'].includes(value.type)
    && /^([01]\d|2[0-3]):[0-5]\d$/.test(value.startTime)
    && /^([01]\d|2[0-3]):[0-5]\d$/.test(value.endTime)
    && value.startTime !== value.endTime && Array.isArray(value.days)
    && (value.type !== 'custom' || value.days.length > 0);
}
