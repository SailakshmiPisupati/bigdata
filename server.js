const express = require('express'),
 ws = require('./ws'),
 app = express(),
 fs = require("fs"),
 https = require("https"),
 http = require('http'),
 forceSsl = require('express-force-ssl');

app.use(forceSsl);
app.get('/', function (req, res) {
   res.sendFile(__dirname + '/index.html');
})

const options = {
      key: fs.readFileSync('encryption/key.pem', 'utf8'),
      cert: fs.readFileSync('encryption/server.crt', 'utf8')
};

const httpsServer = https.createServer(options, app).listen(3000);
console.log('HTTPS Server listening on ', 3000);
// http.createServer(app).listen(3000, function () {
//    console.log('HTTP WebSocket example app listening on port 3000!')
// });