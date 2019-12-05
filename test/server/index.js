/* global __dirname */
const express = require('express');
const app = express();
const path = require('path');
const PORT = 9000;

app.use('/dist', express.static(path.join(__dirname, '../../dist')));

app.get('/(*[^(.js|.css)])?', function(req, res) {
  console.log("sending:", path.resolve(__dirname, '/index.html'));
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT);
console.log(`[SERVER RUNNING] 127.0.0.1:${PORT}`);
