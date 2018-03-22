const fs = require("fs"),
    express = require('express'),
    ws = require('./ws'),
    app = express(),
    http = require('http'),
    https = require('https');

// app.all('*', function(req, res) {
//   console.log("HTTP: " + req);
//   return res.redirect("https://" + req.headers["host"] + req.url);
// });

// app.error(function(error, req, res, next) {
//   return console.log("App error " + error + ", " + req.url);
// });

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html');
})

http.createServer(app).listen(3000, () => {
   console.log('HTTP WebSocket example app listening on port 3000!')
});

// https.createServer({
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// }, app).listen(4000, function () {
//    console.log('HTTPS WebSocket example app listening on port 4000!')
// });
