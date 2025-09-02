import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Script started
dotenv.config();

async function main() {
  // Connecting to MongoDB...
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kysely');
  // Connected to MongoDB

  // Importing User model...
  const User = (await import('../models/User')).default;
  // Looking for user "Pasi"...
  const user = await User.findOne({ username: 'Pasi' });
  if (!user) {
    console.error('User "Pasi" not found!');
    process.exit(1);
  }
  // Hashing new password...
  const hash = await bcrypt.hash('mipeha', 10);
  user.password = hash;
  await user.save();
  // Password for "Pasi" updated
  await mongoose.disconnect();
  // Disconnected from MongoDB
}

main().catch(err => { console.error('Script error:', err); process.exit(1); });
