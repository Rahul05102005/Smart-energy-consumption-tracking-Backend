import 'dotenv/config';
import app from '../src/app.js';
import { connectDatabase } from '../src/db.js';
let ready;
export default async function handler(req,res) {
  try { if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET is missing or too short.'); ready ||= connectDatabase(); await ready; return app(req,res); }
  catch (error) { console.error(error); return res.status(500).json({message:'API database unavailable.'}); }
}
