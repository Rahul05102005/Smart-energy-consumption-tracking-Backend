import mongoose from 'mongoose';
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
  console.log(`MongoDB connected (${mongoose.connection.name}); collections ready`);
}
