const Room = require('../models/Room');

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const room = await Room.create({ name });
    res.status(201).json({
      roomId: room._id,
      name: room.name,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createRoom, getRooms };
