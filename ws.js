/*

http://www.giacomovacca.com/2015/02/websockets-over-nodejs-from-plain-to.html
- referred this article to setup WSS

*/

const express = require('express'),
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
  server: httpsServer,
  rejectUnauthorized: false
});

  /*
      ** Authentication **

      You might use location.query.access_token to authenticate or share sessions
      or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  */

wss.on('connection', (ws, req) => {
  limit(ws)
  ws.isAlive = true;

  console.log('---------Connection Opened---------');
  // const location = url.parse(req.url, true);
  // console.log('req: ', Object.keys(req));
  console.log('Origin: ', req.headers.origin); // Client IP
  console.log('URL: ', req.url); // path of websocket url
  console.log('remoteAddress: ', req.connection.remoteAddress);
  // console.log('req.headers: ', Object.keys(req.headers));
  console.log('Cookie: ', req.headers.cookie);
  console.log('x-forwarded-for: ', req.headers['x-forwarded-for']);
  console.log('------------------------------------');
  ws.send('All glory to WebSockets!');

  ws.on('message', function (message) {
    console.log('Message received: %s', message)
  })

  ws.on('pong', () => {
    this.isAlive = true;
  });

  ws.on('close', function () {
    console.log('Connection Closed');
    clearInterval(sendInterval);
  });

  const sendInterval = setInterval(() => {
    if (ws.isAlive) {
      try {
        ws.send(`${new Date()}`);
      } catch (e) {
        ws.isAlive = false;
        console.log('WS send Error caught !', e);
      }
    } else {
      console.log("Websocket not alive");
    }

  }, 1000)

});

const interval = setInterval(function ping() {
  wss.clients.forEach((ws) =>{
    if (ws.isAlive === false) {
      console.log("Terminating WebSocket");
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(() => { });
  });
}, 30000);