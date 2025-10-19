const router = require('express').Router();
const auth = require('../authMiddleware');
const userController = require('../controllers/user');

router.get('/me', auth, userController.me);

module.exports = router;
