// Rebuilds db/*.db with fictional demo data: npm run seed
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Datastore = require('@seald-io/nedb');

const DB_DIR = path.join(__dirname, '..', 'db');
const DEMO_PASSWORD = 'dance-demo';

const open = name => {
  const filename = path.join(DB_DIR, `${name}.db`);
  fs.rmSync(filename, { force: true });
  return new Datastore({ filename, autoload: true });
};

const STUDIO_1 = 'Studio 1, The Granary';
const STUDIO_2 = 'Studio 2, The Granary';
const MIRROR_ROOM = 'Mirror Room, Riverside Arts Centre';
const MAIN_HALL = 'Main Hall, Northgate Community Centre';

const courses = [
  {
    key: 'salsa',
    name: 'Salsa Foundations',
    description: 'Basic steps, turns and timing on the one. Partner work starts in week three, so come solo or bring a friend.',
    duration: '8 weeks',
    classes: [
      { date: '2027-01-12', time: '19:00', location: STUDIO_1, price: 12 },
      { date: '2027-01-14', time: '18:00', location: STUDIO_1, price: 12 },
      { date: '2027-03-09', time: '19:00', location: STUDIO_1, price: 12 }
    ]
  },
  {
    key: 'contemporary',
    name: 'Contemporary Flow',
    description: 'Floor work, release technique and short phrases set to live piano. Expect to move, breathe and sweat a little.',
    duration: '6 weeks',
    classes: [
      { date: '2027-01-13', time: '18:30', location: MIRROR_ROOM, price: 14 },
      { date: '2027-02-24', time: '18:30', location: MIRROR_ROOM, price: 14 }
    ]
  },
  {
    key: 'hiphop',
    name: 'Hip Hop Grooves',
    description: 'Bounces, rocks and old-school grooves that build into a full routine you perform in the last class.',
    duration: '6 weeks',
    classes: [
      { date: '2027-01-11', time: '17:30', location: MAIN_HALL, price: 10 },
      { date: '2027-02-22', time: '17:30', location: MAIN_HALL, price: 10 }
    ]
  },
  {
    key: 'bachata',
    name: 'Bachata Partnerwork',
    description: 'Connection, lead and follow, and the body waves bachata is known for. For improvers who know the basic step.',
    duration: '10 weeks',
    classes: [
      { date: '2027-01-15', time: '20:00', location: STUDIO_2, price: 13.5 },
      { date: '2027-03-26', time: '20:00', location: STUDIO_2, price: 13.5 }
    ]
  },
  {
    key: 'ballet',
    name: 'Weekend Ballet Intensive',
    description: 'Two full days at the barre and in the centre: posture, pliés, port de bras and a short variation to finish.',
    duration: '2 days',
    classes: [
      { date: '2027-01-23', time: '10:00', location: MIRROR_ROOM, price: 65 },
      { date: '2027-03-13', time: '10:00', location: MIRROR_ROOM, price: 65 }
    ]
  },
  {
    key: 'lindy',
    name: 'Lindy Hop Social',
    description: 'Swing-outs, Charleston and plenty of social dancing to big-band records. Complete beginners welcome.',
    duration: '4 weeks',
    classes: [
      { date: '2027-01-16', time: '19:30', location: MAIN_HALL, price: 9 },
      { date: '2027-02-13', time: '19:30', location: MAIN_HALL, price: 9 }
    ]
  }
];

const dancers = [
  ['Maya Okafor', 'salsa', 0],
  ['Leo Brennan', 'salsa', 0],
  ['Priya Nair', 'salsa', 0],
  ['Tom Whitfield', 'salsa', 1],
  ['Sofia Marin', 'contemporary', 0],
  ['Ewan Fraser', 'contemporary', 0],
  ['Hana Sato', 'hiphop', 0],
  ['Jamal Reid', 'hiphop', 0],
  ['Chloe Duncan', 'hiphop', 0],
  ['Isla McKenzie', 'bachata', 0],
  ['Diego Alvarez', 'bachata', 0],
  ['Grace Liddell', 'ballet', 0],
  ['Nora Quinn', 'lindy', 0],
  ['Callum Ross', 'lindy', 0]
];

const run = async () => {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const users = open('users');
  const courseDb = open('courses');
  const classDb = open('classes');
  const enrolments = open('enrolments');

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await users.insertAsync([
    { username: 'organiser', password: hash, role: 'organiser' },
    { username: 'maya', password: hash, role: 'user' },
    { username: 'leo', password: hash, role: 'user' }
  ]);

  const classIds = {};
  for (const { key, classes, ...course } of courses) {
    const saved = await courseDb.insertAsync(course);
    classIds[key] = { courseId: saved._id, ids: [] };
    for (const cls of classes) {
      const savedClass = await classDb.insertAsync({ courseId: saved._id, description: '', ...cls });
      classIds[key].ids.push(savedClass._id);
    }
  }

  let phone = 900101;
  for (const [name, key, index] of dancers) {
    const { courseId, ids } = classIds[key];
    await enrolments.insertAsync({
      courseId,
      classId: ids[index],
      name,
      email: `${name.split(' ')[0].toLowerCase()}@example.com`,
      phone: `07700 ${phone++}`
    });
  }

  for (const db of [users, courseDb, classDb, enrolments]) await db.compactDatafileAsync();
  console.log(`Seeded ${courses.length} courses, ${dancers.length} enrolments. Log in as organiser / ${DEMO_PASSWORD}.`);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
