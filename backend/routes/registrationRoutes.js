const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const registrationController = require('../controllers/registrationController');

router.get('/me/courses', auth('student'), registrationController.getRegisteredCourses);
router.post('/me/courses/:courseId', auth('student'), registrationController.registerCourse);
router.delete('/me/courses/:courseId', auth('student'), registrationController.dropCourse);

module.exports = router;
