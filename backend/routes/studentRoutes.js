const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

router.post('/register', studentController.register);
router.post('/login', studentController.login);
router.get('/me', auth('student'), studentController.getProfile);

module.exports = router;
