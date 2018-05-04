/*
  WSS - http://www.giacomovacca.com/2015/02/websockets-over-nodejs-from-plain-to.html
*/

const express = require('express'),
      app = express(),
      _  = require('lodash'),
      fs = require("fs"),
      https = require("https"),
      url = require('url'),
      rateLimit = require('./rate-limit.js'),
      limit = rateLimit('10s', 10),
      WebSocketServer = require('ws').Server;

const httpsServer = https.createServer({
  key: fs.readFileSync('encryption/key.pem', 'utf8'),
  cert: fs.readFileSync('encryption/cert.pem', 'utf8')
}, app).listen(40510, function () {
   console.log('HTTPS Websocket server listening on port 40510')
});

const wss = new WebSocketServer({
  server: httpsServer,
  rejectUnauthorized: true,
  clientTracking: true,
  verifyClient: (info) => {
    // console.log('verifyClient', info);

    console.log('---------Verifying Client---------');
    // const location = url.parse(req.url, true);
    // console.log('req: ', Object.keys(req));
    console.log('Origin: ', info.req.headers.origin); // Client IP
    // console.log('x-forwarded-for: ', info.req.headers['x-forwarded-for']);
    // console.log('URL: ', info.req.url); // path of websocket url
    console.log('remoteAddress: ', info.req.connection.remoteAddress);
    // console.log('info.req.headers: ', Object.keys(info.req.headers));

    let cookies = parseCookies(info.req.headers.cookie);
    console.log('Cookies: ', cookies);

    // TODO - verify this token and return false if its not correct
    let csrf = cookies['_csrf'];
    console.log('CSRF token: ', csrf);

    /*
        ** Same Origin Policy **
        This only allows websocket connections from the specified origin
    */
    if (info.origin !== 'https://localhost:3001') {
      return false;
    }

    if (!info.secure) {
      return false;
    }

    return true;
  }
});

function parseCookies (cookieString) {
  var split_read_cookie = cookieString.split(";");
  var out = {};

  for (let i=0 ; i<split_read_cookie.length;i++){
    let value = split_read_cookie[i].split("=");
    out[_.trim(value[0])] = _.trim(value[1]);
  }

  return out;
}

  /*
      ** Authentication **

      You might use location.query.access_token to authenticate or share sessions
      or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  */

wss.on('headers', (headers) => {
  // console.log('---------Headers---------', headers);
  headers.push('Set-Cookie: my-cookie=qwerty');
});
wss.on('connection', (ws, req) => {
  limit(ws, req);
  ws.isAlive = true;

  console.log('---------Connection Opened---------');

  ws.send('All glory to WebSockets!');

  ws.on('message', function (message) {
    console.log('---------Message received: ---------%s---------', message);
    ws.send(message);
  })

  ws.on('pong', () => {
    this.isAlive = true;
  });

  ws.on('close', () => {
    console.log('---------Connection Closed---------');
    clearInterval(sendInterval);
  });

  ws.on('limited', data => {
    console.log('Rate Limited `' + data + '`');
    console.log(data);
  })


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

  }, 5000)

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