const express = require('express');
const Message = require('../../models/Message');

const router = express.Router();

router.get('/', async (req, res) => {
  res.send(await Message.find({}).sort({ date: -1 }).limit(3));
});

router.get('/latest_message', async (req, res) => {
  res.send(await Message.findOne().sort({ date: -1 }));
});

module.exports = router; 