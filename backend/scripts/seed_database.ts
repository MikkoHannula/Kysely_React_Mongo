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
    // Tietotekniikka
    { category: catDocs[0]._id, question: 'Mikä on tietokoneen keskusyksikön tehtävä?', options: ['Tallentaa tietoa', 'Suorittaa laskutoimituksia', 'Näyttää kuvia', 'Tulostaa asiakirjoja'], correctAnswer: 1 },
    { category: catDocs[0]._id, question: 'Mikä seuraavista on käyttöjärjestelmä?', options: ['Microsoft Word', 'Windows 10', 'Google Chrome', 'Photoshop'], correctAnswer: 1 },
    { category: catDocs[0]._id, question: 'Mitä tarkoittaa lyhenne RAM?', options: ['Random Access Memory', 'Read And Modify', 'Rapid Application Management', 'Remote Access Module'], correctAnswer: 0 },
    { category: catDocs[0]._id, question: 'Mikä laite yhdistää tietokoneen verkkoon?', options: ['Näytönohjain', 'Modeemi', 'Hiiri', 'Kovalevy'], correctAnswer: 1 },
    { category: catDocs[0]._id, question: 'Mikä on internetin protokolla, jolla verkkosivut siirretään?', options: ['FTP', 'HTTP', 'SMTP', 'SSH'], correctAnswer: 1 },
    { category: catDocs[0]._id, question: 'Mikä seuraavista on ohjelmointikieli?', options: ['HTML', 'Python', 'JPEG', 'USB'], correctAnswer: 1 },
    { category: catDocs[0]._id, question: 'Mikä on tietoturvan tarkoitus?', options: ['Nopeuttaa tietokonetta', 'Suojata tietoja', 'Parantaa grafiikkaa', 'Vähentää virrankulutusta'], correctAnswer: 1 },
    { category: catDocs[0]._id, question: 'Mikä laite tallentaa pysyvästi tietoa?', options: ['RAM', 'SSD', 'Prosessori', 'Näyttö'], correctAnswer: 1 },
    { category: catDocs[0]._id, question: 'Mikä on pilvipalvelu?', options: ['Ohjelma tietokoneella', 'Tiedon tallennus internetissä', 'Tietokoneen osa', 'Verkkokaapeli'], correctAnswer: 1 },
    { category: catDocs[0]._id, question: 'Mikä seuraavista on selain?', options: ['Excel', 'Firefox', 'PowerPoint', 'Word'], correctAnswer: 1 },
    { category: catDocs[0]._id, question: 'Mikä on IP-osoite?', options: ['Tietokoneen nimi', 'Verkkotunnus', 'Laitteen yksilöllinen osoite verkossa', 'Salasana'], correctAnswer: 2 },
    { category: catDocs[0]._id, question: 'Mikä on USB:n pääasiallinen käyttötarkoitus?', options: ['Näytön liittäminen', 'Tiedonsiirto', 'Internet-yhteys', 'Äänen toisto'], correctAnswer: 1 },
    { category: catDocs[0]._id, question: 'Mikä on tietokoneen BIOS?', options: ['Käyttöjärjestelmä', 'Käynnistysohjelmisto', 'Tallennuslaite', 'Näytönohjain'], correctAnswer: 1 },
    { category: catDocs[0]._id, question: 'Mikä seuraavista on tiedostopääte?', options: ['.docx', '.www', '.net', '.com'], correctAnswer: 0 },
    { category: catDocs[0]._id, question: 'Mikä on hakkeri?', options: ['Tietokoneen valmistaja', 'Tietoturva-asiantuntija', 'Henkilö, joka murtautuu järjestelmiin', 'Ohjelmistokehittäjä'], correctAnswer: 2 },
    // Historia
    { category: catDocs[1]._id, question: 'Kuka oli Suomen ensimmäinen presidentti?', options: ['Urho Kekkonen', 'K.J. Ståhlberg', 'Mauno Koivisto', 'Tarja Halonen'], correctAnswer: 1 },
    { category: catDocs[1]._id, question: 'Missä kaupungissa järjestettiin ensimmäiset olympialaiset?', options: ['Rooma', 'Ateena', 'Pariisi', 'Lontoo'], correctAnswer: 1 },
    { category: catDocs[1]._id, question: 'Kuka keksi sähkölampun?', options: ['Nikola Tesla', 'Thomas Edison', 'Alexander Graham Bell', 'Albert Einstein'], correctAnswer: 1 },
    { category: catDocs[1]._id, question: 'Milloin Suomi itsenäistyi?', options: ['1917', '1945', '1809', '2000'], correctAnswer: 0 },
    { category: catDocs[1]._id, question: 'Kuka oli antiikin Kreikan tunnetuin filosofi?', options: ['Platon', 'Aristoteles', 'Sokrates', 'Herodotos'], correctAnswer: 0 },
    { category: catDocs[1]._id, question: 'Mikä valtio oli ensimmäinen demokratia?', options: ['Rooma', 'Ateena', 'Egypti', 'Kiina'], correctAnswer: 1 },
    { category: catDocs[1]._id, question: 'Kuka oli Ranskan vallankumouksen johtaja?', options: ['Napoleon Bonaparte', 'Ludvig XVI', 'Robespierre', 'Marie Antoinette'], correctAnswer: 0 },
    { category: catDocs[1]._id, question: 'Missä maassa pyramideja rakennettiin?', options: ['Kreikassa', 'Egyptissä', 'Italiassa', 'Kiinassa'], correctAnswer: 1 },
    { category: catDocs[1]._id, question: 'Kuka oli Neuvostoliiton johtaja toisen maailmansodan aikana?', options: ['Vladimir Lenin', 'Josef Stalin', 'Nikita Khrushchev', 'Boris Jeltsin'], correctAnswer: 1 },
    { category: catDocs[1]._id, question: 'Mikä vuosi tunnetaan mustana perjantaina pörssissä?', options: ['1929', '1987', '2008', '2010'], correctAnswer: 0 },
    { category: catDocs[1]._id, question: 'Kuka oli Englannin kuningatar 1500-luvulla?', options: ['Viktoria', 'Elisabet I', 'Maria Stuart', 'Anna'], correctAnswer: 1 },
    { category: catDocs[1]._id, question: 'Missä kaupungissa Berliinin muuri sijaitsi?', options: ['Pariisi', 'Berliini', 'Moskova', 'Praha'], correctAnswer: 1 },
    { category: catDocs[1]._id, question: 'Kuka oli Yhdysvaltojen presidentti sisällissodan aikana?', options: ['George Washington', 'Abraham Lincoln', 'John F. Kennedy', 'Franklin D. Roosevelt'], correctAnswer: 1 },
    { category: catDocs[1]._id, question: 'Mikä oli Rooman valtakunnan pääkaupunki?', options: ['Ateena', 'Rooma', 'Pariisi', 'Istanbul'], correctAnswer: 1 },
    { category: catDocs[1]._id, question: 'Kuka oli Suomen marsalkka talvisodassa?', options: ['Mannerheim', 'Paasikivi', 'Ryti', 'Svinhufvud'], correctAnswer: 0 },
    // Matematiikka
    { category: catDocs[2]._id, question: 'Mikä on 7 + 8?', options: ['14', '15', '16', '17'], correctAnswer: 1 },
    { category: catDocs[2]._id, question: 'Mikä on kolmion kulmien summa?', options: ['90°', '180°', '270°', '360°'], correctAnswer: 1 },
    { category: catDocs[2]._id, question: 'Mikä on 5 * 6?', options: ['25', '30', '35', '36'], correctAnswer: 1 },
    { category: catDocs[2]._id, question: 'Mikä on piin likiarvo kahden desimaalin tarkkuudella?', options: ['3.12', '3.14', '3.16', '3.18'], correctAnswer: 1 },
    { category: catDocs[2]._id, question: 'Mikä on neliön sivujen määrä?', options: ['3', '4', '5', '6'], correctAnswer: 1 },
    { category: catDocs[2]._id, question: 'Mikä on 100 jaettuna 4:llä?', options: ['20', '25', '30', '40'], correctAnswer: 1 },
    { category: catDocs[2]._id, question: 'Mikä on 9^2?', options: ['18', '81', '27', '72'], correctAnswer: 1 },
    { category: catDocs[2]._id, question: 'Mikä on 1/2 desimaalilukuna?', options: ['0.2', '0.5', '0.7', '1.0'], correctAnswer: 1 },
    { category: catDocs[2]._id, question: 'Mikä on suorakulmion pinta-ala, kun sivut ovat 5 ja 3?', options: ['8', '15', '10', '18'], correctAnswer: 1 },
    { category: catDocs[2]._id, question: 'Mikä on 12 jaettuna 3:lla?', options: ['4', '3', '6', '9'], correctAnswer: 0 },
    { category: catDocs[2]._id, question: 'Mikä on 2^5?', options: ['10', '16', '32', '64'], correctAnswer: 2 },
    { category: catDocs[2]._id, question: 'Mikä on ympyrän kehän kaava?', options: ['πr^2', '2πr', 'r^2', 'πd'], correctAnswer: 1 },
    { category: catDocs[2]._id, question: 'Mikä on 0 jaettuna millä tahansa luvulla?', options: ['0', '1', '∞', 'Ei määritelty'], correctAnswer: 0 },
    { category: catDocs[2]._id, question: 'Mikä on 3 * 7?', options: ['21', '24', '27', '30'], correctAnswer: 0 },
    { category: catDocs[2]._id, question: 'Mikä on 1000 jaettuna 10:llä?', options: ['10', '100', '1000', '1'], correctAnswer: 1 },
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
