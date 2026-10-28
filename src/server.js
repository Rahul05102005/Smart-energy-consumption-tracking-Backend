import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './db.js';
const port = Number(process.env.PORT || 5000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET is missing or too short. Set a random value of at least 32 characters in backend/.env.');
await connectDatabase();
app.listen(port, () => console.log(`EnergyTrack API listening on http://localhost:${port}`));
