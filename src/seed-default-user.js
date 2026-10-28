import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from './db.js';
import { User } from './models.js';

try {
  await connectDatabase();
  const email = process.env.DEFAULT_USER_EMAIL.trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) throw new Error('The default user was not created.');
  const passwordMatches = await bcrypt.compare(process.env.DEFAULT_USER_PASSWORD, user.password_hash);
  if (!passwordMatches) {
    user.password_hash = await bcrypt.hash(process.env.DEFAULT_USER_PASSWORD, 12);
    await user.save();
  }
  console.log('Default login credentials initialized and verified.');
} finally {
  await mongoose.disconnect();
}
