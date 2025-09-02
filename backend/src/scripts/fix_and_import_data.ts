// This script will:
// 1. Remove all questions and categories from the database
// 2. Insert categories (if not already present)
// 3. Insert questions, mapping category names to correct ObjectIds
//
// Usage: npx ts-node backend/src/scripts/fix_and_import_data.ts

import mongoose from 'mongoose';
import Category from '../models/Category';
import Question from '../models/Question';

// Use the full mock data from import_legacy_data.ts
const legacyCategories: Array<{ name: string }> = [
  { name: 'Historia' },
  { name: 'Matematiikka' },
  { name: 'Tietotekniikka' },
];

const legacyQuestions: Array<{ category: string; question: string; options: string[]; correctAnswer: number }> = [];
const mockQuestions: Record<string, { question: string; options: string[]; correctAnswer: number }[]> = {
  1: [
    { question: 'Minä vuonna Suomi itsenäistyi?', options: ['1917', '1918', '1919', '1920'], correctAnswer: 0 },
    { question: 'Kuka oli Suomen ensimmäinen presidentti?', options: ['Urho Kekkonen', 'K.J. Ståhlberg', 'P.E. Svinhufvud', 'Carl Gustaf Mannerheim'], correctAnswer: 1 },
    { question: 'Minä vuonna Suomi liittyi Euroopan unioniin?', options: ['1993', '1994', '1995', '1996'], correctAnswer: 2 },
    { question: 'Mikä oli Suomen pääkaupunki ennen Helsinkiä?', options: ['Turku', 'Tampere', 'Viipuri', 'Porvoo'], correctAnswer: 0 },
    { question: 'Milloin Suomi sai oman rahan, markan?', options: ['1860', '1870', '1880', '1890'], correctAnswer: 0 },
    { question: 'Minä vuonna Suomi sai ensimmäisen naispresidentin?', options: ['2000', '2012', '2010', '2008'], correctAnswer: 0 },
    { question: 'Mikä oli Suomen ensimmäinen rautatie?', options: ['Helsinki-Tampere', 'Helsinki-Hämeenlinna', 'Turku-Helsinki', 'Tampere-Oulu'], correctAnswer: 1 },
    { question: 'Minä vuonna Suomi järjesti ensimmäiset olympialaiset?', options: ['1948', '1950', '1952', '1956'], correctAnswer: 2 },
    { question: 'Kuka oli Suomen pitkäaikaisin presidentti?', options: ['Urho Kekkonen', 'C.G.E. Mannerheim', 'J.K. Paasikivi', 'Mauno Koivisto'], correctAnswer: 0 },
    { question: 'Milloin Suomi siirtyi euroon?', options: ['1999', '2000', '2001', '2002'], correctAnswer: 3 },
    { question: 'Mikä oli Viipurin linnan rakennusvuosi?', options: ['1293', '1311', '1323', '1346'], correctAnswer: 0 },
    { question: 'Minä vuonna perustettiin Suomen ensimmäinen yliopisto?', options: ['1540', '1560', '1600', '1640'], correctAnswer: 3 },
    { question: 'Milloin Suomen peruskoulu-uudistus alkoi?', options: ['1968', '1972', '1976', '1980'], correctAnswer: 1 },
    { question: 'Minä vuonna Suomi sai oman lipun?', options: ['1917', '1918', '1919', '1920'], correctAnswer: 1 },
    { question: 'Kuka oli Suomen ensimmäinen olympiavoittaja?', options: ['Hannes Kolehmainen', 'Paavo Nurmi', 'Ville Ritola', 'Verner Järvinen'], correctAnswer: 0 },
  ],
  2: [
    { question: 'Mikä on 7 x 8?', options: ['54', '56', '58', '52'], correctAnswer: 1 },
    { question: 'Mikä on piin (π) likiarvo kahden desimaalin tarkkuudella?', options: ['3.14', '3.16', '3.12', '3.18'], correctAnswer: 0 },
    { question: 'Kuinka monta astetta on ympyrässä?', options: ['180', '270', '360', '400'], correctAnswer: 2 },
    { question: 'Mikä on kuutiojuuri luvusta 27?', options: ['2', '3', '4', '9'], correctAnswer: 1 },
    { question: 'Mikä on kolmion kulmien summa?', options: ['90°', '180°', '270°', '360°'], correctAnswer: 1 },
    { question: 'Mikä on 15% sadasta?', options: ['10', '15', '20', '25'], correctAnswer: 1 },
    { question: 'Mikä on suorakulmaisen kolmion hypotenuusan laskukaava?', options: ['a² + b²', 'a² + b² = c²', 'a + b = c', 'a × b = c'], correctAnswer: 1 },
    { question: 'Kuinka monta sivua on kuutiossa?', options: ['4', '6', '8', '12'], correctAnswer: 1 },
    { question: 'Mikä on 2⁴?', options: ['8', '16', '32', '64'], correctAnswer: 1 },
    { question: 'Mikä on mediaani luvuista: 1, 3, 3, 6, 7, 8, 9?', options: ['3', '6', '5', '7'], correctAnswer: 1 },
    { question: 'Montako astetta on suora kulma?', options: ['45°', '90°', '180°', '360°'], correctAnswer: 1 },
    { question: 'Mikä on lukujen 24 ja 36 suurin yhteinen tekijä?', options: ['6', '12', '18', '24'], correctAnswer: 1 },
    { question: 'Mikä on 1/4 desimaaleina?', options: ['0.25', '0.4', '0.5', '0.75'], correctAnswer: 0 },
    { question: 'Mikä on kolmion pinta-alan kaava?', options: ['a × b', 'a × h', '(a × h) / 2', 'a + b + c'], correctAnswer: 2 },
    { question: 'Kuinka monta sivua on oktaedrissa?', options: ['6', '8', '10', '12'], correctAnswer: 1 },
  ],
  3: [
    { question: 'Mikä seuraavista ei ole ohjelmointikieli?', options: ['Python', 'Java', 'Router', 'JavaScript'], correctAnswer: 2 },
    { question: 'Mikä on HTML:n tarkoitus?', options: ['Tietokantojen hallinta', 'Verkkosivujen tyylittely', 'Verkkosivujen rakenne', 'Palvelinohjelmointi'], correctAnswer: 2 },
    { question: 'Mitä tarkoittaa CSS?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Color Style Syntax'], correctAnswer: 1 },
    { question: 'Mikä seuraavista on pilvipalvelu?', options: ['Windows', 'Firefox', 'AWS', 'Notepad'], correctAnswer: 2 },
    { question: 'Mikä on RAM?', options: ['Kiintolevy', 'Suoritin', 'Keskusmuisti', 'Näytönohjain'], correctAnswer: 2 },
    { question: 'Mikä seuraavista on käyttöjärjestelmä?', options: ['Firefox', 'Excel', 'Linux', 'Word'], correctAnswer: 2 },
    { question: 'Mitä tarkoittaa URL?', options: ['Universal Resource Location', 'Uniform Resource Locator', 'United Resource Link', 'Universal Resource Link'], correctAnswer: 1 },
    { question: 'Mikä on tietokoneen prosessorin lyhenne?', options: ['GPU', 'RAM', 'CPU', 'HDD'], correctAnswer: 2 },
    { question: 'Mitä tarkoittaa Wi-Fi?', options: ['Wireless Fidelity', 'Wireless Finding', 'Wire Filter', 'Wide Fidelity'], correctAnswer: 0 },
    { question: 'Mikä seuraavista on selain?', options: ['Windows', 'Chrome', 'Office', 'Photoshop'], correctAnswer: 1 },
    { question: 'Mikä on PDF-tiedoston täydellinen nimi?', options: ['Personal Document Format', 'Portable Document Format', 'Public Document Format', 'Protected Document Format'], correctAnswer: 1 },
    { question: 'Mikä on yleisin tiedostomuoto kuville internetissä?', options: ['PNG', 'JPG', 'GIF', 'BMP'], correctAnswer: 1 },
    { question: 'Mikä on sähköpostin @ -merkin englanninkielinen nimi?', options: ['At sign', 'Monkey tail', 'Snail', 'Circle A'], correctAnswer: 0 },
    { question: 'Mikä seuraavista on varmuuskopiointiin tarkoitettu tallennusväline?', options: ['CPU', 'NAS', 'RAM', 'GPU'], correctAnswer: 1 },
    { question: 'Mitä tarkoittaa HTTPS?', options: ['Hyper Text Transfer Protocol', 'Hyper Text Transfer Protocol Secure', 'High Transfer Text Protocol', 'High Text Transfer Protocol'], correctAnswer: 1 },
  ],
};

// Map category name to mockQuestions key
const catNameToId: Record<string, string> = {
  'Historia': '1',
  'Matematiikka': '2',
  'Tietotekniikka': '3',
};

for (const cat of legacyCategories) {
  const qArr = mockQuestions[catNameToId[cat.name]] || [];
  for (const q of qArr) {
    legacyQuestions.push({ category: cat.name, question: q.question, options: q.options, correctAnswer: q.correctAnswer });
  }
}

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/kysely');
  // Connected to MongoDB

  // Remove all questions and categories
  await Question.deleteMany({});
  await Category.deleteMany({});
  // Cleared old questions and categories

  // Insert categories
  const categoryDocs: Record<string, unknown> = {};
  for (const cat of legacyCategories) {
    const doc = new Category({ name: cat.name });
    await doc.save();
    categoryDocs[cat.name] = doc;
  }
  // Inserted categories

  // Insert questions with correct category ObjectId
  for (const q of legacyQuestions) {
    const catDoc = categoryDocs[q.category];
    if (!catDoc) {
      console.warn('No category found for question:', q);
      continue;
    }
    const question = new Question({
  category: (catDoc as { _id: string })._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    });
    await question.save();
  }
  // Inserted questions
  await mongoose.disconnect();
  // Done!
}

main().catch(e => { console.error(e); process.exit(1); });
