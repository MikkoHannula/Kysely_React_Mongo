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
    { name: 'Yleissivistys' },
    { name: 'Matematiikka' }
  ];
  await Category.deleteMany({});
  const catDocs = await Category.insertMany(categories);

  // Example questions
  const questions = [
    {
      category: catDocs[0]._id,
      question: 'Mikä seuraavista on varmuuskopiointiin tarkoitettu tallennusväline?',
      options: ['CPU', 'NAS', 'RAM', 'GPU'],
      correctAnswer: 1
    },
    {
      category: catDocs[1]._id,
      question: 'Kuka oli Suomen ensimmäinen presidentti?',
      options: ['Urho Kekkonen', 'K. J. Ståhlberg', 'Sauli Niinistö', 'Tarja Halonen'],
      correctAnswer: 1
    },
    {
      category: catDocs[2]._id,
      question: 'Mikä on piin (π) likiarvo kahden desimaalin tarkkuudella?',
      options: ['3.12', '3.14', '3.16', '3.18'],
      correctAnswer: 1
    }
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
