// Script to delete all results from the database
// Usage: npx ts-node scripts/empty_results.ts

import mongoose from 'mongoose';
import Result from '../src/models/Result';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kysely');
  const res = await Result.deleteMany({});
  console.log('Deleted results:', res.deletedCount);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
