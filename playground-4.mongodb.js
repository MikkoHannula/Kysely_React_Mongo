use('kysely');

// List all categories
const categories = db.getCollection('categories').find({}).toArray();

// List all questions
const questions = db.getCollection('questions').find({}).toArray();

// For each question, print its category and check if it matches a category _id
const questionsWithMissingCategory = questions.filter(q => {
  return !categories.find(c => c._id.valueOf() === q.category.valueOf());
});

// Return everything for inspection
({
  categories,
  questions,
  questionsWithMissingCategory
});