import mongoose from 'mongoose';
import Question from '../src/models/Question';
import Category from '../src/models/Category';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/kysely');
  const categories = await Category.find({});
  const questions = await Question.find({});

  categories.forEach(cat => {
  console.log(`\n=== ${cat.name} ===`);
  const catIdStr = (cat._id as any).toString();
  const catQuestions = questions.filter(q => q.category.toString() === catIdStr);
    if (catQuestions.length === 0) {
      console.log('  (No questions)');
    } else {
      catQuestions.forEach(q => {
        console.log(`- ${q.question}`);
        q.options.forEach((opt: string, idx: number) => {
          const correct = idx === q.correctAnswer ? ' (correct)' : '';
          console.log(`    ${String.fromCharCode(65 + idx)}. ${opt}${correct}`);
        });
      });
    }
  });
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
