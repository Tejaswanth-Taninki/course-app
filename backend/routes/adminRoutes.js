const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const courseController = require('../controllers/courseController');

router.post('/login', adminController.adminLogin);

router.get('/dashboard', auth('admin'), adminController.getAdminDashboard);

router.delete(
  '/students/:studentId/courses/:courseId',
  auth('admin'),
  adminController.unregisterStudentCourse
);

router.delete('/students/:studentId', auth('admin'), adminController.deleteStudent);

router.post('/courses', auth('admin'), courseController.createCourse);

router.put('/courses/:courseId', auth('admin'), courseController.updateCourse);

router.delete('/courses/:courseId', auth('admin'), courseController.deleteCourse);

module.exports = router;
