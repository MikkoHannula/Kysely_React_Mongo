// MongoDB Playground: Check questions and categories in kysely DB
use('kysely');

// List all categories
const categories = db.getCollection('categories').find({}).toArray();
console.log('Categories:', categories);

// List all questions
const questions = db.getCollection('questions').find({}).toArray();
console.log('Questions:', questions);

// For each question, print its category and check if it matches a category _id
questions.forEach(q => {
  const cat = categories.find(c => c._id.valueOf() === q.category.valueOf());
  if (!cat) {
    console.log('Question with missing category:', q);
  }
});
