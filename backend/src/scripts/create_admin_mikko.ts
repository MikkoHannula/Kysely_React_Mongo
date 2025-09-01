import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

console.log('Script started');

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kysely');
  console.log('Connected to MongoDB');

  const User = (await import('../models/User')).default;
  const existing = await User.findOne({ username: 'Mikko' });
  if (existing) {
    console.log('User "Mikko" already exists!');
    await mongoose.disconnect();
    return;
  }
  const hash = await bcrypt.hash('mipeha', 10);
  await User.create({ username: 'Mikko', password: hash, role: 'admin' });
  console.log('Admin user "Mikko" created with password "mipeha"');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch(err => { console.error('Script error:', err); process.exit(1); });
