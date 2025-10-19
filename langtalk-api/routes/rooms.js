const router = require('express').Router();
const auth = require('../authMiddleware');
const roomsController = require('../controllers/rooms');

router.post('/', auth, roomsController.createRoom);
router.get('/mine', auth, roomsController.myRooms);
router.post('/:roomId/members', auth, roomsController.addMember);

module.exports = router;
