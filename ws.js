const WebSocketServer = require('ws').Server,
      wss = new WebSocketServer({
        port: 40510,
        // ** Same Origin Policy implemented here - **
        // this only allows websocket connections from the specified origin
        origin: 'http://localhost:3000'
      }),
      url = require('url'),
      rateLimit = require('./rate-limit.js'),
      limit = rateLimit('.5d', 10000);

wss.on('connection', (ws, req) => {
  limit(ws)

  const location = url.parse(req.url, true);
  const ip = req.connection.remoteAddress;
  const x_forwarded_for = req.headers['x-forwarded-for'];
  console.log(req.url , location, ip, x_forwarded_for);

  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  // console.log('ws connection: ' + JSON.stringify(req))

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
});