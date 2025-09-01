import mongoose from 'mongoose';
import Question from '../models/Question';
import Category from '../models/Category';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/kysely');
  const tietotekniikka = await Category.findOne({ name: 'Tietotekniikka' });
  if (!tietotekniikka) {
    console.log('Tietotekniikka category not found');
    process.exit(1);
  }
  const questions = await Question.find({ category: tietotekniikka._id }).lean();
  if (!questions.length) {
    console.log('No questions found for Tietotekniikka');
    process.exit(0);
  }
  questions.forEach(q => {
    console.log('---');
    console.log('Question:', q.question);
    console.log('Options:', q.options);
    console.log('correctAnswer index:', q.correctAnswer);
    console.log('correct option:', q.options && typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : 'N/A');
  });
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
