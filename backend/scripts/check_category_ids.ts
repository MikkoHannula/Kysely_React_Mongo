// Script to print all category IDs in the database and compare them to a list of IDs used in the frontend
// Usage: npx ts-node scripts/check_category_ids.ts

import mongoose from 'mongoose';
import Category from '../src/models/Category';

const USED_CATEGORY_IDS = [
  // Add the category IDs you want to check here
  '68a0896e3920f6406bc0baa6',
  '68a0896e3920f6406bc0baa8',
  '68a0896e3920f6406bc0baaa',
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kysely');
  const categories = await Category.find({}, '_id name');
  // Cast to any to avoid TS18046 error on _id
  const dbIds = categories.map((c: any) => c._id.toString());
  console.log('Categories in DB:');
  (categories as any[]).forEach(c => console.log(`  ${c._id}  ${c.name}`));
  console.log('\nIDs used in frontend:', USED_CATEGORY_IDS);
  const missing = USED_CATEGORY_IDS.filter(id => !dbIds.includes(id));
  if (missing.length) {
    console.log('\nIDs used in frontend but NOT found in DB:', missing);
  } else {
    console.log('\nAll used IDs are present in the DB.');
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
