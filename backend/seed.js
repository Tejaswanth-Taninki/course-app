const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const Course = require('./models/Course');
const Student = require('./models/Student');

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/courseRegDB';

// Helper to hash passwords matching studentController format
const hashPassword = (
  password,
  salt = crypto.randomBytes(16).toString('hex')
) => ({
  salt,
  hash: crypto.scryptSync(password, salt, 64).toString('hex'),
});

const COURSE_DATA = [
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

const STUDENT_DATA = [
  {
    rollNo: '21CS001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@university.edu',
    password: 'Password@123',
    department: 'Computer Science & Engg.',
    semester: '5th Semester',
    preRegisterCourses: ['CS301', 'CS304'],
  },
  {
    rollNo: '21IT015',
    name: 'Priya Patel',
    email: 'priya.patel@university.edu',
    password: 'Password@123',
    department: 'Information Technology',
    semester: '5th Semester',
    preRegisterCourses: ['IT302'],
  },
  {
    rollNo: '22AI005',
    name: 'Rohan Verma',
    email: 'rohan.verma@university.edu',
    password: 'Password@123',
    department: 'AI & Data Science',
    semester: '3rd Semester',
    preRegisterCourses: ['AI401'],
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to: ${MONGO_URI}`);

    console.log('\n--- 1. Seeding Courses ---');
    const courseMap = {};
    for (const item of COURSE_DATA) {
      const course = await Course.findOneAndUpdate(
        { code: item.code },
        { $set: item },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      courseMap[item.code] = course._id;
      console.log(`✓ Course: ${item.code} - ${item.title}`);
    }

    console.log('\n--- 2. Seeding Default Students ---');
    for (const stu of STUDENT_DATA) {
      const { hash, salt } = hashPassword(stu.password);
      const registeredCourseIds = (stu.preRegisterCourses || [])
        .map((code) => courseMap[code])
        .filter(Boolean);

      await Student.findOneAndUpdate(
        { rollNo: stu.rollNo },
        {
          $set: {
            rollNo: stu.rollNo,
            name: stu.name,
            email: stu.email,
            passwordHash: hash,
            passwordSalt: salt,
            department: stu.department,
            semester: stu.semester,
            registeredCourses: registeredCourseIds,
            loginCount: 0,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(
        `✓ Student: ${stu.rollNo} (${stu.name}) - Email: ${stu.email} | Default Password: ${stu.password}`
      );
    }

    console.log('\n===========================================');
    console.log('✅ Database seeded successfully!');
    console.log('Credentials to test login:');
    console.log('  Student 1: 21CS001 | Password@123');
    console.log('  Student 2: 21IT015 | Password@123');
    console.log('  Student 3: 22AI005 | Password@123');
    console.log('  Admin:     admin@university.edu | Admin@123');
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
