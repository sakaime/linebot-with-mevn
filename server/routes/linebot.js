const express = require('express');
const line = require('@line/bot-sdk');
const Message = require('../models/Message');
require('dotenv').config();

const router = express.Router();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};
const client = new line.Client(config);

const returnRouter = function (io) {
  router.post('/', line.middleware(config), (req, res) => {
    const events = req.body.events;
    Promise.all(events.map(event => {
      return handleEvent(event).catch(() => { return null });
    }))
      .then(result => {
        // イベントの処理が完了したことを Soket.io でクライアントサイドに通知する
        io.sockets.emit('message-saved');

        res.status(200).json({}).end();
      })
  });

  return router;
}

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resoleve(null);
  }

  // MongoDB にメッセージを保存する
  const userId = event.source.userId;
  const userProfile = await client.getProfile(userId);

  const messageData = {
    content: event.message.text,
    user_name: userProfile.displayName,
    date: event.timestamp
  };

  await Message.create(messageData);

  // リプライでメッセージを保存したことを知らせる
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: 'メッセージを保存しました'
  });
}

module.exports = returnRouter;