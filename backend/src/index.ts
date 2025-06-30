import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import Category from './models/Category';
import Question from './models/Question';
import User from './models/User';
import Result from './models/Result';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kysely')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 2 }
}));

// --- Example route ---
app.get('/', (req, res) => {
  res.send('Kysely backend running!');
});

// --- Category Routes ---
app.get('/api/categories', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

app.post('/api/categories', async (req, res) => {
  const { name } = req.body;
  const category = new Category({ name });
  await category.save();
  res.status(201).json(category);
});

app.put('/api/categories/:id', async (req, res) => {
  const { name } = req.body;
  const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
  res.json(category);
});

app.delete('/api/categories/:id', async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  await Question.deleteMany({ category: req.params.id });
  res.status(204).end();
});

// --- Question Routes ---
app.get('/api/questions', async (req, res) => {
  const questions = await Question.find().populate('category');
  res.json(questions);
});

app.get('/api/questions/:categoryId', async (req, res) => {
  const questions = await Question.find({ category: req.params.categoryId });
  res.json(questions);
});

app.post('/api/questions', async (req, res) => {
  const { category, question, options, correctAnswer } = req.body;
  const q = new Question({ category, question, options, correctAnswer });
  await q.save();
  res.status(201).json(q);
});

app.put('/api/questions/:id', async (req, res) => {
  const { category, question, options, correctAnswer } = req.body;
  const q = await Question.findByIdAndUpdate(
    req.params.id,
    { category, question, options, correctAnswer },
    { new: true }
  );
  res.json(q);
});

app.delete('/api/questions/:id', async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// --- User Routes (with session-based auth) ---
app.post('/api/login', (req, res) => {
  (async () => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Käyttäjää ei löydy' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Väärä salasana' });
    req.session.userId = String(user._id);
    req.session.role = user.role;
    res.json({ id: user._id, username: user.username, role: user.role });
  })();
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.status(204).end());
});

app.get('/api/me', (req, res) => {
  (async () => {
    if (!req.session.userId) return res.status(401).json({ message: 'Ei kirjautunut' });
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ message: 'Käyttäjää ei löydy' });
    res.json({ id: user._id, username: user.username, role: user.role });
  })();
});

app.get('/api/users', (req, res) => {
  (async () => {
    if (req.session.role !== 'admin') return res.status(403).json({ message: 'Ei oikeuksia' });
    const users = await User.find();
    res.json(users);
  })();
});

app.post('/api/users', (req, res) => {
  (async () => {
    if (req.session.role !== 'admin') return res.status(403).json({ message: 'Ei oikeuksia' });
    const { username, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash, role });
    await user.save();
    res.status(201).json(user);
  })();
});

app.put('/api/users/:id', (req, res) => {
  (async () => {
    if (req.session.role !== 'admin') return res.status(403).json({ message: 'Ei oikeuksia' });
    const { username, password, role } = req.body;
    const update: any = { username, role };
    if (password) update.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(user);
  })();
});

app.delete('/api/users/:id', (req, res) => {
  (async () => {
    if (req.session.role !== 'admin') return res.status(403).json({ message: 'Ei oikeuksia' });
    await User.findByIdAndDelete(req.params.id);
    res.status(204).end();
  })();
});

// --- Results Routes ---
app.get('/api/results', async (req, res) => {
  const results = await Result.find().populate('category');
  res.json(results);
});

app.post('/api/results', async (req, res) => {
  const { name, category, score, scoreValue, total, date } = req.body;
  const result = new Result({ name, category, score, scoreValue, total, date });
  await result.save();
  res.status(201).json(result);
});

app.put('/api/results/:id', async (req, res) => {
  const { name, category, score, scoreValue, total, date } = req.body;
  const result = await Result.findByIdAndUpdate(
    req.params.id,
    { name, category, score, scoreValue, total, date },
    { new: true }
  );
  res.json(result);
});

app.delete('/api/results/:id', async (req, res) => {
  await Result.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// --- Quiz Flow Endpoint ---
// Get random questions for quiz (by category, count)
app.post('/api/quiz', async (req, res) => {
  try {
    const { category, count } = req.body;
    if (!category || !count) {
      return res.status(400).json({ message: 'Category and count required' });
    }
    // Get all questions for the category
    const questions = await Question.find({ category });
    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this category' });
    }
    // Shuffle and pick random questions
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, questions.length));
    // Remove correctAnswer from response for quiz security
    const quizQuestions = selected.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      category: q.category
    }));
    res.json(quizQuestions);
  } catch (err) {
    res.status(500).json({ message: 'Quiz fetch error', error: err });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
