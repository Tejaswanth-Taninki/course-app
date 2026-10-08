const crypto = require('crypto');
const Student = require('../models/Student');
const { createSession } = require('../middleware/auth');

const hashPassword = (
  password,
  salt = crypto.randomBytes(16).toString('hex')
) => ({
  salt,
  hash: crypto.scryptSync(password, salt, 64).toString('hex'),
});

const verifyPassword = (password, salt, expectedHash) => {
  try {
    const actual = crypto.scryptSync(password, salt, 64).toString('hex');

    return crypto.timingSafeEqual(
      Buffer.from(actual, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  } catch {
    return false;
  }
};

const passwordError = (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must contain at least 8 characters.';
  }

  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return 'Password must include uppercase, lowercase, a number, and a special character.';
  }

  return null;
};

const publicStudent = (student) => ({
  id: student._id,
  rollNo: student.rollNo,
  name: student.name,
  email: student.email,
  department: student.department,
  semester: student.semester,
  loginCount: student.loginCount || 0,
  lastLoginAt: student.lastLoginAt,
  createdAt: student.createdAt,
});

exports.register = async (req, res) => {
  try {
    const { rollNo, name, email, password, department, semester } = req.body;

    const normalizedRollNo = String(rollNo || '')
      .trim()
      .toUpperCase();

    const normalizedEmail = String(email || '')
      .trim()
      .toLowerCase();

    const cleanName = String(name || '').trim();

    if (!/^[A-Z0-9]{4,20}$/.test(normalizedRollNo)) {
      return res.status(400).json({
        message:
          'Please enter a valid roll number (4-20 alphanumeric characters).',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'Please enter a valid university email address.',
      });
    }

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({
        message: 'Please enter a valid full name.',
      });
    }

    const err = passwordError(password);
    if (err) {
      return res.status(400).json({
        message: err,
      });
    }

    if (!department || !semester) {
      return res.status(400).json({
        message: 'Department and Semester selection are required.',
      });
    }

    const { hash, salt } = hashPassword(password);

    const student = await Student.create({
      rollNo: normalizedRollNo,
      name: cleanName,
      email: normalizedEmail,
      passwordHash: hash,
      passwordSalt: salt,
      department,
      semester,
      loginCount: 1,
      lastLoginAt: new Date(),
    });

    const token = createSession('student', student._id.toString());

    res.status(201).json({
      token,
      user: publicStudent(student),
      message: 'Account successfully registered!',
    });
  } catch (error) {
    if (error?.code === 11000) {
      const field =
        Object.keys(error.keyPattern || {})[0] || 'Roll number or Email';

      return res.status(409).json({
        message: `A student with this ${
          field === 'email' ? 'email' : 'roll number'
        } is already registered.`,
      });
    }

    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Failed to create student account. Please try again.',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const identifier = String(req.body.identifier || '').trim();
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({
        message: 'Please enter both your Roll Number / Email and Password.',
      });
    }

    const student = await Student.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { rollNo: identifier.toUpperCase() },
      ],
    }).select('+passwordHash +passwordSalt');

    if (
      !student ||
      !verifyPassword(password, student.passwordSalt, student.passwordHash)
    ) {
      return res.status(401).json({
        message: 'Invalid Roll Number / Email or password.',
      });
    }

    student.loginCount = (student.loginCount || 0) + 1;
    student.lastLoginAt = new Date();
    await student.save();

    const token = createSession('student', student._id.toString());

    res.json({
      token,
      user: publicStudent(student),
      message: 'Welcome back!',
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      message: 'Failed to sign in. Please try again.',
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.session.userId);

    if (!student) {
      return res.status(404).json({
        message: 'Student record not found.',
      });
    }

    res.json(publicStudent(student));
  } catch (error) {
    res.status(500).json({
      message: 'Could not fetch student profile.',
    });
  }
};
