// Script to create admin user "Pasi" with password "mipeha"
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kysely';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const existing = await User.findOne({ username: 'Pasi' });
  if (existing) {
    console.log('User "Pasi" already exists.');
    await mongoose.disconnect();
    return;
  }
  const hash = await bcrypt.hash('mipeha', 10);
  await User.create({ username: 'Pasi', password: hash, role: 'admin' });
  console.log('Admin user "Pasi" created with password "mipeha".');
  await mongoose.disconnect();
}

main().catch(err => { console.error('Script error:', err); process.exit(1); });
