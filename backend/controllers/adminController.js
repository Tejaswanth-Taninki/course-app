const Student = require('../models/Student');
const Course = require('../models/Course');
const { createSession } = require('../middleware/auth');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@university.edu';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

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

const courseWithEnrollment = async (course) => {
  const doc = course.toObject ? course.toObject() : course;
  const enrolledCount = await Student.countDocuments({
    registeredCourses: doc._id,
  });

  return {
    ...doc,
    id: doc._id,
    enrolled: enrolledCount,
  };
};

const getCourses = async () => {
  const courses = await Course.find().sort({
    code: 1,
  });

  return Promise.all(courses.map(courseWithEnrollment));
};

exports.adminLogin = (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide admin email and password.',
      });
    }

    const validEmail = email === ADMIN_EMAIL.toLowerCase();
    const validPassword = password === ADMIN_PASSWORD;

    if (!validEmail || !validPassword) {
      return res.status(401).json({
        message: 'Invalid administrator email or password.',
      });
    }

    const token = createSession('admin', null, {
      email: ADMIN_EMAIL,
    });

    res.json({
      token,
      admin: {
        email: ADMIN_EMAIL,
        name: 'University Administrator',
      },
      message: 'Admin authentication successful',
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      message: 'Admin authentication failed.',
    });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const [students, courses] = await Promise.all([
      Student.find().populate('registeredCourses').sort({
        createdAt: -1,
      }),
      getCourses(),
    ]);

    const formattedStudents = students.map((s) => ({
      ...publicStudent(s),
      registeredCourses: (s.registeredCourses || []).map((c) => ({
        id: c._id,
        code: c.code,
        title: c.title,
        credits: c.credits,
        department: c.department,
        instructor: c.instructor,
        schedule: c.schedule,
        room: c.room,
        prerequisite: c.prerequisite,
      })),
      totalCredits: (s.registeredCourses || []).reduce(
        (sum, c) => sum + (c.credits || 0),
        0
      ),
    }));

    const totalRegistrations = formattedStudents.reduce(
      (sum, s) => sum + s.registeredCourses.length,
      0
    );

    const totalLogins = formattedStudents.reduce(
      (sum, s) => sum + (s.loginCount || 0),
      0
    );

    const totalCapacity = courses.reduce(
      (sum, c) => sum + (c.capacity || 0),
      0
    );

    const totalEnrolledSeats = courses.reduce(
      (sum, c) => sum + (c.enrolled || 0),
      0
    );

    res.json({
      stats: {
        students: formattedStudents.length,
        courses: courses.length,
        registrations: totalRegistrations,
        totalLogins,
        totalCapacity,
        totalEnrolledSeats,
        occupancyRate:
          totalCapacity > 0
            ? Math.round((totalEnrolledSeats / totalCapacity) * 100)
            : 0,
      },
      students: formattedStudents,
      courses,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      message: 'Failed to load admin dashboard data.',
    });
  }
};

exports.unregisterStudentCourse = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        message: 'Student record not found.',
      });
    }

    student.registeredCourses = student.registeredCourses.filter(
      (id) => !id.equals(req.params.courseId)
    );

    await student.save();

    res.json({
      message: 'Course registration removed for this student.',
    });
  } catch (error) {
    console.error('Admin unregister student error:', error);
    res.status(500).json({
      message: 'Failed to remove course registration.',
    });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        message: 'Student record not found.',
      });
    }

    res.json({
      message: `Student ${student.name} (${student.rollNo}) deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      message: 'Failed to delete student record.',
    });
  }
};
