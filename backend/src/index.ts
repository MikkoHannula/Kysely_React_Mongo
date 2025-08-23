import express, { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
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
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories', error: err });
  }
});

app.post('/api/categories', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error creating category', error: err });
  }
});

app.put('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error updating category', error: err });
  }
});

app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    await Question.deleteMany({ category: req.params.id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category', error: err });
  }
});

// --- Question Routes ---
app.get('/api/questions', async (req: Request, res: Response) => {
  try {
    const questions = await Question.find().populate('category');
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching questions', error: err });
  }
});

app.get('/api/questions/:categoryId', async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.categoryId;
    const questions = await Question.find({ category: new Types.ObjectId(categoryId) });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching questions by category', error: err });
  }
});

app.post('/api/questions', async (req: Request, res: Response) => {
  try {
    const { category, question, options, correctAnswer } = req.body;
    const q = new Question({ category, question, options, correctAnswer });
    await q.save();
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ message: 'Error creating question', error: err });
  }
});

app.put('/api/questions/:id', async (req: Request, res: Response) => {
  try {
    const { category, question, options, correctAnswer } = req.body;
    const q = await Question.findByIdAndUpdate(
      req.params.id,
      { category, question, options, correctAnswer },
      { new: true }
    );
    res.json(q);
  } catch (err) {
    res.status(500).json({ message: 'Error updating question', error: err });
  }
});

app.delete('/api/questions/:id', async (req: Request, res: Response) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting question', error: err });
  }
});

// --- User Routes (with session-based auth) ---
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: 'Käyttäjää ei löydy' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: 'Väärä salasana' });
      return;
    }
    req.session.userId = String(user._id);
    req.session.role = user.role;
    res.json({ id: user._id, username: user.username, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login error', error: err instanceof Error ? err.message : err });
  }
});

app.post('/api/logout', async (req: Request, res: Response) => {
  req.session.destroy((err: any) => {
    if (err) {
      res.status(500).json({ message: 'Logout error', error: err });
      return;
    }
    res.status(204).end();
  });
});

app.get('/api/me', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ message: 'Ei kirjautunut' });
      return;
    }
    const user = await User.findById(req.session.userId);
    if (!user) {
      res.status(401).json({ message: 'Käyttäjää ei löydy' });
      return;
    }
    res.json({ id: user._id, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Me error', error: err });
  }
});

app.get('/api/users', async (req: Request, res: Response) => {
  try {
    if (req.session.role !== 'admin') {
      res.status(403).json({ message: 'Ei oikeuksia' });
      return;
    }
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Users fetch error', error: err });
  }
});

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    if (req.session.role !== 'admin') {
      res.status(403).json({ message: 'Ei oikeuksia' });
      return;
    }
    const { username, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash, role });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'User create error', error: err });
  }
});

app.put('/api/users/:id', async (req: Request, res: Response) => {
  try {
    if (req.session.role !== 'admin') {
      res.status(403).json({ message: 'Ei oikeuksia' });
      return;
    }
    const { username, password, role } = req.body;
    const update: Partial<{ username: string; password: string; role: string }> = { username, role };
    if (password) update.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'User update error', error: err });
  }
});

app.delete('/api/users/:id', async (req: Request, res: Response) => {
  try {
    if (req.session.role !== 'admin') {
      res.status(403).json({ message: 'Ei oikeuksia' });
      return;
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'User delete error', error: err });
  }
});

// --- Results Routes ---
app.get('/api/results', async (req: Request, res: Response) => {
  try {
    const results = await Result.find().populate('category');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching results', error: err });
  }
});

app.post('/api/results', async (req: Request, res: Response) => {
  try {
    const { name, category, score, scoreValue, total, date } = req.body;
    const result = new Result({ name, category, score, scoreValue, total, date });
    await result.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error creating result', error: err });
  }
});

app.put('/api/results/:id', async (req: Request, res: Response) => {
  try {
    const { name, category, score, scoreValue, total, date } = req.body;
    const result = await Result.findByIdAndUpdate(
      req.params.id,
      { name, category, score, scoreValue, total, date },
      { new: true }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error updating result', error: err });
  }
});

app.delete('/api/results/:id', async (req: Request, res: Response) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting result', error: err });
  }
});

// --- Quiz Flow Endpoint ---
// Get random questions for quiz (by category, count)
app.post('/api/quiz', async (req: Request, res: Response) => {
  try {
    const { category, count } = req.body;
    if (!category || !count) {
      res.status(400).json({ message: 'Category and count required' });
      return;
    }
    // Get all questions for the category
    let categoryId;
    try {
      categoryId = new Types.ObjectId(category);
    } catch (e) {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }
    const questions = await Question.find({ category: categoryId });
    if (questions.length === 0) {
      res.status(404).json({ message: 'No questions found for this category' });
      return;
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
