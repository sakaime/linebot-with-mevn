const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Midlewares
app.use(/^(\/callback.+|(?!\/callback).{0,})$/, express.json());
app.use(/^(\/callback.+|(?!\/callback).{0,})$/, express.urlencoded({ extended: true }));
app.use(cors());

// Connect DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Initialize Socket.io
const server = http.Server(app);
const io = require('socket.io').listen(server);

// Routing
const messages = require('./routes/api/messages');
const callback = require('./routes/linebot')(io);
app.use('/api/messages', messages);
app.use('/callback', callback);

// Handle production
if (process.env.NODE_ENV === 'production') {
  // Static folder
  app.use(express.static(__dirname + '/public'));

  // Handle SPA
  app.get('/.*/', (req, res) => res.sendFile(__dirname + '/public'));
}

const port = process.env.PORT || 5000;
server.listen(port);