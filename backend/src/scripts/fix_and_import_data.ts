// This script will:
// 1. Remove all questions and categories from the database
// 2. Insert categories (if not already present)
// 3. Insert questions, mapping category names to correct ObjectIds
//
// Usage: npx ts-node backend/src/scripts/fix_and_import_data.ts

import mongoose from 'mongoose';
import Category from '../models/Category';
import Question from '../models/Question';

// --- Replace with your legacy data ---
const legacyCategories: Array<{ name: string }> = [
  { name: 'Historia' },
  { name: 'Matematiikka' },
  { name: 'Luonto' },
  // ...
];

const legacyQuestions: Array<{ category: string; question: string; options: string[]; correctAnswer: number }> = [
  { category: 'Historia', question: 'Minä vuonna Suomi itsenäistyi?', options: ['1917', '1918', '1919', '1920'], correctAnswer: 0 },
  { category: 'Historia', question: 'Kuka oli Suomen ensimmäinen presidentti?', options: ['Urho Kekkonen', 'K.J. Ståhlberg', 'P.E. Svinhufvud', 'Carl Gustaf Mannerheim'], correctAnswer: 1 },
  { category: 'Matematiikka', question: 'Mikä on 7 x 8?', options: ['54', '56', '58', '52'], correctAnswer: 1 },
  { category: 'Matematiikka', question: 'Mikä on piin (π) likiarvo kahden desimaalin tarkkuudella?', options: ['3.14', '3.16', '3.12', '3.18'], correctAnswer: 0 },
  { category: 'Luonto', question: 'Mikä on Suomen kansalliskukka?', options: ['Kielo', 'Sinivuokko', 'Ruusu', 'Orvokki'], correctAnswer: 0 },
  { category: 'Luonto', question: 'Mikä on Suomen suurin järvi?', options: ['Inarijärvi', 'Päijänne', 'Saimaa', 'Oulujärvi'], correctAnswer: 2 },
];

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/kysely');
  console.log('Connected to MongoDB');

  // Remove all questions and categories
  await Question.deleteMany({});
  await Category.deleteMany({});
  console.log('Cleared old questions and categories');

  // Insert categories
  const categoryDocs: Record<string, any> = {};
  for (const cat of legacyCategories) {
    const doc = new Category({ name: cat.name });
    await doc.save();
    categoryDocs[cat.name] = doc;
  }
  console.log('Inserted categories');

  // Insert questions with correct category ObjectId
  for (const q of legacyQuestions) {
    const catDoc = categoryDocs[q.category];
    if (!catDoc) {
      console.warn('No category found for question:', q);
      continue;
    }
    const question = new Question({
      category: catDoc._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    });
    await question.save();
  }
  console.log('Inserted questions');
  await mongoose.disconnect();
  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
