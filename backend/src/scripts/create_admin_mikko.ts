import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

// Script started

async function main() {
  // Connecting to MongoDB...
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kysely');
  // Connected to MongoDB

  const User = (await import('../models/User')).default;
  const existing = await User.findOne({ username: 'Mikko' });
  if (existing) {
  // User "Mikko" already exists!
    await mongoose.disconnect();
    return;
  }
  const hash = await bcrypt.hash('mipeha', 10);
  await User.create({ username: 'Mikko', password: hash, role: 'admin' });
  // Admin user "Mikko" created
  await mongoose.disconnect();
  // Disconnected from MongoDB
}

main().catch(err => { console.error('Script error:', err); process.exit(1); });
