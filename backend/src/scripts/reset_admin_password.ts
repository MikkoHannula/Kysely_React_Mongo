import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

console.log('Script started');
dotenv.config();

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kysely');
  console.log('Connected to MongoDB');

  console.log('Importing User model...');
  const User = (await import('../models/User')).default;
  console.log('Looking for user "Pasi"...');
  const user = await User.findOne({ username: 'Pasi' });
  if (!user) {
    console.error('User "Pasi" not found!');
    process.exit(1);
  }
  console.log('Hashing new password...');
  const hash = await bcrypt.hash('mipeha', 10);
  user.password = hash;
  await user.save();
  console.log('Password for "Pasi" updated to "mipeha"');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch(err => { console.error('Script error:', err); process.exit(1); });
