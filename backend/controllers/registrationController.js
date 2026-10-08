const Student = require('../models/Student');
const Course = require('../models/Course');
const { courseWithEnrollment } = require('./courseController');

const MAX_CREDITS = 24;

exports.getRegisteredCourses = async (req, res) => {
  try {
    const student = await Student.findById(req.session.userId).populate(
      'registeredCourses'
    );

    if (!student) {
      return res.status(404).json({
        message: 'Student not found.',
      });
    }

    const list = await Promise.all(
      (student.registeredCourses || []).map(courseWithEnrollment)
    );

    res.json(list);
  } catch (error) {
    console.error('Error fetching student registered courses:', error);
    res.status(500).json({
      message: 'Could not load your courses.',
    });
  }
};

exports.registerCourse = async (req, res) => {
  try {
    const student = await Student.findById(req.session.userId).populate(
      'registeredCourses'
    );
    const course = await Course.findById(req.params.courseId);

    if (!student) {
      return res.status(404).json({
        message: 'Student not found.',
      });
    }

    if (!course) {
      return res.status(404).json({
        message: 'Course not found.',
      });
    }

    if (student.registeredCourses.some((c) => c._id.equals(course._id))) {
      return res.status(409).json({
        message: `You are already registered for ${course.code} (${course.title}).`,
      });
    }

    const currentCredits = student.registeredCourses.reduce(
      (sum, c) => sum + (c.credits || 0),
      0
    );

    if (currentCredits + course.credits > MAX_CREDITS) {
      return res.status(400).json({
        message: `Cannot register: Maximum credit limit is ${MAX_CREDITS}. Current: ${currentCredits}, Course: ${course.credits}.`,
      });
    }

    const enrolledCount = await Student.countDocuments({
      registeredCourses: course._id,
    });

    if (enrolledCount >= course.capacity) {
      return res.status(400).json({
        message: `Registration closed: ${course.code} has reached full capacity.`,
      });
    }

    student.registeredCourses.push(course._id);
    await student.save();

    const updatedCourse = await courseWithEnrollment(course);

    res.status(201).json({
      message: `Successfully registered for ${course.code}: ${course.title}`,
      course: updatedCourse,
    });
  } catch (error) {
    console.error('Course registration error:', error);
    res.status(500).json({
      message: 'Failed to register for course.',
    });
  }
};

exports.dropCourse = async (req, res) => {
  try {
    const student = await Student.findById(req.session.userId);

    if (!student) {
      return res.status(404).json({
        message: 'Student not found.',
      });
    }

    const initialCount = student.registeredCourses.length;

    student.registeredCourses = student.registeredCourses.filter(
      (id) => !id.equals(req.params.courseId)
    );

    if (student.registeredCourses.length === initialCount) {
      return res.status(404).json({
        message: 'Course was not in your registered list.',
      });
    }

    await student.save();

    res.json({
      message: 'Course dropped successfully.',
    });
  } catch (error) {
    console.error('Drop course error:', error);
    res.status(500).json({
      message: 'Failed to drop course.',
    });
  }
};
