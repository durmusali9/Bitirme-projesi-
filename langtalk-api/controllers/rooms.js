const Room = require('../models/room');

exports.createRoom = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const room = await Room.create({ name, owner: req.user.userId, members: [req.user.userId] });
    return res.status(201).json(room);
  } catch (err) {
    return next(err);
  }
};

exports.myRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ members: req.user.userId }).populate('owner', 'username email');
    return res.json(rooms);
  } catch (err) {
    return next(err);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.owner.toString() !== req.user.userId) return res.status(403).json({ error: 'Only owner can add members' });

    if (!room.members.some((m) => m.toString() === userId)) {
      room.members.push(userId);
      await room.save();
    }

    return res.json(room);
  } catch (err) {
    return next(err);
  }
};
