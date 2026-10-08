const Course = require('../models/Course');
const Student = require('../models/Student');

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

exports.courseWithEnrollment = courseWithEnrollment;
exports.getCourses = getCourses;

exports.getAllCourses = async (req, res) => {
  try {
    const list = await getCourses();
    res.json(list);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      message: 'Could not load courses.',
    });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const {
      code,
      title,
      instructor,
      credits,
      department,
      capacity,
      schedule,
      room,
      prerequisite,
    } = req.body;

    if (
      !code ||
      !title ||
      !instructor ||
      !credits ||
      !department ||
      !capacity ||
      !schedule ||
      !room
    ) {
      return res.status(400).json({
        message: 'All course fields are required.',
      });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const existing = await Course.findOne({
      code: normalizedCode,
    });

    if (existing) {
      return res.status(409).json({
        message: `A course with code "${normalizedCode}" already exists.`,
      });
    }

    const newCourse = await Course.create({
      code: normalizedCode,
      title: String(title).trim(),
      instructor: String(instructor).trim(),
      credits: Number(credits),
      department: String(department).trim(),
      capacity: Number(capacity),
      schedule: String(schedule).trim(),
      room: String(room).trim(),
      prerequisite: String(prerequisite || 'None').trim(),
    });

    res.status(201).json({
      message: `Course ${newCourse.code} created successfully!`,
      course: await courseWithEnrollment(newCourse),
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      message: 'Failed to create course.',
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const {
      title,
      instructor,
      credits,
      department,
      capacity,
      schedule,
      room,
      prerequisite,
    } = req.body;

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        message: 'Course not found.',
      });
    }

    if (title) course.title = String(title).trim();
    if (instructor) course.instructor = String(instructor).trim();
    if (credits) course.credits = Number(credits);
    if (department) course.department = String(department).trim();
    if (capacity) course.capacity = Number(capacity);
    if (schedule) course.schedule = String(schedule).trim();
    if (room) course.room = String(room).trim();
    if (prerequisite !== undefined) {
      course.prerequisite = String(prerequisite).trim();
    }

    await course.save();

    res.json({
      message: `Course ${course.code} updated successfully.`,
      course: await courseWithEnrollment(course),
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      message: 'Failed to update course.',
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        message: 'Course not found.',
      });
    }

    await Student.updateMany(
      {},
      {
        $pull: {
          registeredCourses: course._id,
        },
      }
    );

    res.json({
      message: `Course ${course.code} and its student registrations were deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      message: 'Failed to delete course.',
    });
  }
};
