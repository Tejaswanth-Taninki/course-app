const mongoose = require('mongoose');

const COURSE_SEED = [
  {
    code: 'CS301',
    title: 'Data Structures & Algorithms',
    instructor: 'Dr. Alan Turing',
    credits: 4,
    department: 'Computer Science & Engg.',
    capacity: 60,
    schedule: 'Mon / Wed 10:00 AM - 11:30 AM',
    room: 'Lab-301',
    prerequisite: 'CS101 (Programming Fundamentals)',
  },
  {
    code: 'CS304',
    title: 'Database Management Systems',
    instructor: 'Prof. Edgar Codd',
    credits: 4,
    department: 'Computer Science & Engg.',
    capacity: 55,
    schedule: 'Tue / Thu 02:00 PM - 03:30 PM',
    room: 'LH-102',
    prerequisite: 'CS201 (Data Structures)',
  },
  {
    code: 'CS402',
    title: 'Operating Systems & System Programming',
    instructor: 'Dr. Linus Torvalds',
    credits: 4,
    department: 'Computer Science & Engg.',
    capacity: 50,
    schedule: 'Mon / Fri 01:00 PM - 02:30 PM',
    room: 'Lab-204',
    prerequisite: 'CS202 (Computer Architecture)',
  },
  {
    code: 'IT302',
    title: 'Web Technologies & Cloud Architecture',
    instructor: 'Dr. Tim Berners-Lee',
    credits: 3,
    department: 'Information Technology',
    capacity: 60,
    schedule: 'Tue / Thu 10:00 AM - 11:30 AM',
    room: 'IT-Lab 2',
    prerequisite: 'CS101 (Programming)',
  },
  {
    code: 'IT405',
    title: 'Cyber Security & Cryptography',
    instructor: 'Prof. Adi Shamir',
    credits: 4,
    department: 'Information Technology',
    capacity: 45,
    schedule: 'Mon / Wed 02:00 PM - 03:30 PM',
    room: 'LH-305',
    prerequisite: 'MA301 (Discrete Math)',
  },
  {
    code: 'EC204',
    title: 'Digital Signal Processing',
    instructor: 'Dr. Claude Shannon',
    credits: 3,
    department: 'Electronics & Comm. Engg.',
    capacity: 45,
    schedule: 'Tue / Fri 09:00 AM - 10:30 AM',
    room: 'EC-LH3',
    prerequisite: 'EC101 (Circuit Analysis)',
  },
  {
    code: 'EE202',
    title: 'Control Systems & Automation',
    instructor: 'Dr. Nikola Tesla',
    credits: 4,
    department: 'Electrical & Electronics Engg.',
    capacity: 50,
    schedule: 'Mon / Thu 11:30 AM - 01:00 PM',
    room: 'EE-LH1',
    prerequisite: 'EE101 (Network Theory)',
  },
  {
    code: 'ME201',
    title: 'Thermodynamics & Heat Transfer',
    instructor: 'Dr. James Watt',
    credits: 4,
    department: 'Mechanical Engineering',
    capacity: 65,
    schedule: 'Mon / Wed 09:00 AM - 10:30 AM',
    room: 'ME-LH2',
    prerequisite: 'PH101 (Engineering Physics)',
  },
  {
    code: 'CE203',
    title: 'Structural Analysis & Mechanics',
    instructor: 'Dr. Gustave Eiffel',
    credits: 4,
    department: 'Civil Engineering',
    capacity: 50,
    schedule: 'Tue / Fri 11:00 AM - 12:30 PM',
    room: 'CE-LH1',
    prerequisite: 'ME101 (Engineering Mechanics)',
  },
  {
    code: 'AI401',
    title: 'Machine Learning & Neural Networks',
    instructor: 'Dr. Geoffrey Hinton',
    credits: 4,
    department: 'AI & Data Science',
    capacity: 40,
    schedule: 'Thu / Sat 10:00 AM - 11:30 AM',
    room: 'AI-Lab',
    prerequisite: 'MA301, CS301',
  },
];

let mongoPromise = null;

async function connectDB() {
  const MONGO_URI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/courseRegDB';

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!mongoPromise) {
    console.log('Connecting to MongoDB...');

    const Course = require('../models/Course');

    mongoPromise = mongoose
      .connect(MONGO_URI)
      .then(async () => {
        console.log('MongoDB connected successfully.');

        for (const item of COURSE_SEED) {
          await Course.updateOne(
            { code: item.code },
            {
              $setOnInsert: item,
            },
            {
              upsert: true,
            }
          );
        }

        console.log('Course catalog seeded/verified.');
      })
      .catch((error) => {
        mongoPromise = null;
        console.error('Database connection failed:', error);
        throw error;
      });
  }

  await mongoPromise;
}

module.exports = connectDB;
