// Seed script for Kysely Quiz/Admin app
// Run with: npx ts-node backend/scripts/seed_database.ts

import mongoose from 'mongoose';
import Category from '../src/models/Category';
import Question from '../src/models/Question';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kysely';

async function seed() {
  await mongoose.connect(MONGODB_URI);

  // Example categories
  const categories = [
    { name: 'Tietotekniikka' },
    { name: 'Historia' },
    { name: 'Matematiikka' }
  ];
  await Category.deleteMany({});
  const catDocs = await Category.insertMany(categories);


  // Example questions for each category
  const questions = [
    ...Array.from({ length: 15 }, (_, i) => ({
      category: catDocs[0]._id,
      text: `Tietotekniikka kysymys ${i + 1}`,
      options: [
        `Vaihtoehto A (${i + 1})`,
        `Vaihtoehto B (${i + 1})`,
        `Vaihtoehto C (${i + 1})`,
        `Vaihtoehto D (${i + 1})`
      ],
      correctOption: i % 4
    })),
    ...Array.from({ length: 15 }, (_, i) => ({
      category: catDocs[1]._id,
      text: `Historia kysymys ${i + 1}`,
      options: [
        `Vaihtoehto A (${i + 1})`,
        `Vaihtoehto B (${i + 1})`,
        `Vaihtoehto C (${i + 1})`,
        `Vaihtoehto D (${i + 1})`
      ],
      correctOption: (i + 1) % 4
    })),
    ...Array.from({ length: 15 }, (_, i) => ({
      category: catDocs[2]._id,
      text: `Matematiikka kysymys ${i + 1}`,
      options: [
        `Vaihtoehto A (${i + 1})`,
        `Vaihtoehto B (${i + 1})`,
        `Vaihtoehto C (${i + 1})`,
        `Vaihtoehto D (${i + 1})`
      ],
      correctOption: (i + 2) % 4
    })),
  ];
  await Question.deleteMany({});
  await Question.insertMany(questions);

  console.log('Seed data inserted!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
