import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Profile, Appliance, UserSettings, Recommendation, EnergyChallenge, ApplianceUsageHistory } from './models.js';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required');
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || 'energytrack' });
  // MongoDB creates a database only after its first collection is created.
  for (const model of [User, Profile, Appliance, UserSettings, Recommendation, EnergyChallenge, ApplianceUsageHistory]) {
    const exists = await mongoose.connection.db.listCollections({ name: model.collection.name }, { nameOnly: true }).hasNext();
    if (!exists) {
      await mongoose.connection.createCollection(model.collection.name);
    }
    await model.createIndexes();
  }
  await ensureDefaultUser();
  console.log(`MongoDB connected (${mongoose.connection.name}); collections ready`);
}

async function ensureDefaultUser() {
  const email = process.env.DEFAULT_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.DEFAULT_USER_PASSWORD;
  if (!email && !password) return;
  if (!email || !password || password.length < 8) throw new Error('Set both DEFAULT_USER_EMAIL and a DEFAULT_USER_PASSWORD of at least 8 characters in backend/.env.');

  let user = await User.findOne({ email });
  if (!user) {
    try {
      user = await User.create({ name: process.env.DEFAULT_USER_NAME || 'Rahul Hariharan', email, password_hash: await bcrypt.hash(password, 12) });
      console.log('Default user created from backend/.env.');
    } catch (error) {
      if (error?.code !== 11000) throw error;
      user = await User.findOne({ email });
    }
  }
  if (!user) throw new Error('Could not initialize the default user.');
  await Promise.all([
    Profile.updateOne({ user_id: user._id }, { $setOnInsert: { user_id: user._id, name: user.name, email: user.email } }, { upsert: true }),
    UserSettings.updateOne({ user_id: user._id }, { $setOnInsert: { user_id: user._id } }, { upsert: true }),
  ]);
}
