/*

http://www.giacomovacca.com/2015/02/websockets-over-nodejs-from-plain-to.html
- referred this article to setup WSS

*/

const express = require('express'),
      ws = require('./ws'),
      app = express(),
      fs = require("fs"),
      https = require("https"),
      url = require('url'),
      rateLimit = require('./rate-limit.js'),
      limit = rateLimit('.5d', 10000),
      WebSocketServer = require('ws').Server;

const httpsServer = https.createServer({
  key: fs.readFileSync('encryption/server.key', 'utf8'),
  cert: fs.readFileSync('encryption/server.crt', 'utf8')
}, app).listen(40510, function () {
   console.log('HTTPS Websocket server listening on port 40510')
});

const wss = new WebSocketServer({
  /*
      ** Same Origin Policy **
      This only allows websocket connections from the specified origin
  */
  origin: 'https://localhost:3001',
  server: httpsServer
});

wss.on('connection', (ws, req) => {
  limit(ws)

  // const location = url.parse(req.url, true);
  // console.log('req: ', Object.keys(req));
  console.log('req.headers.origin: ', req.headers.origin); // Client IP
  console.log('req.url: ', req.url); // path of websocket url
  console.log('req.connection.remoteAddress: ', req.connection.remoteAddress);
  // console.log('req.headers: ', Object.keys(req.headers));
  console.log('req.headers.cookie: ', req.headers.cookie);
  console.log('req.headers[\'x-forwarded-for\']: ', req.headers['x-forwarded-for']);

  /*
      ** Authentication **

      You might use location.query.access_token to authenticate or share sessions
      or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  */

  ws.on('message', function (message) {
    console.log('Message received: %s', message)
  })

  try {
    setInterval(() => ws.send(`${new Date()}`), 1000)
  } catch (e) {
    /* handle error */
    console.error('WS send Error caught !')
    throw e
  }

  ws.isAlive = true;
  ws.on('pong', () => {
    this.isAlive = true;
  });

});

const interval = setInterval(function ping() {
  wss.clients.forEach((ws) =>{
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(() => { });
  });
}, 30000);