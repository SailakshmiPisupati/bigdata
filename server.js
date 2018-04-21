const express = require('express'),
      path = require('path'),
      ws = require('./ws'),
      app = express(),
      fs = require("fs"),
      https = require("https"),
      http = require('http'),
      forceSsl = require('express-force-ssl');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));

app.set('forceSSLOptions', {
  enable301Redirects: true,
  trustXFPHeader: false,
  httpsPort: 3001,
  sslRequiredMessage: 'SSL Required.'
});

app.use(forceSsl);

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/index.html');
})

http.createServer(app).listen(3000, function () {
   console.log('HTTP App listening on port 3000')
});

https.createServer({
  key: fs.readFileSync('encryption/key.pem', 'utf8'),
  cert: fs.readFileSync('encryption/cert.pem', 'utf8')
}, app).listen(3001, function () {
   console.log('HTTPS App listening on port 3001')
});
