'use strict'

const _ = require('lodash');

const duration = require('css-duration')

/**
 * Rate limit a `ws` client.
 *
 * ```js
 * var limit = rateLimit('.5d', 10000)
 *
 * wss.on('connection', client => {
 *   limit(client)
 * })
 * ```
 */


function rateLimit (rate, max) {
  const clients = []
  const IPAddresses = {};

  // Create an interval that resets message counts
  setInterval(() => {
    let i = clients.length
    while (i--) clients[i].messageCount = 0
  }, duration(rate))

  // Apply limiting to client:
  return function limit (client, req) {
    client.messageCount = 0
    client.on('newListener', function (name, listener) {
      if (name !== 'message' || listener._rated) return

      let cookies = parseCookies(req.headers.cookie);
      let ip_address = cookies['ip_address'];
      if (!IPAddresses.hasOwnProperty(ip_address))
        IPAddresses[ip_address] = 0;

      // Rate limiting wrapper over listener:
      function ratedListener (data, flags) {
        if (client.messageCount++ >= max) {
          client.emit('limited', data, flags)
        } else if (IPAddresses[ip_address]++ >= max) {
          client.emit('limited', data, flags)
          console.log('IP rate limiting');
        } else {
          listener(data, flags)
        }
      }
      ratedListener._rated = true
      client.on('message', ratedListener)

      // Unset user's listener:
      process.nextTick(() => client.removeListener('message', listener))
    })

    // Push on clients array, and add handler to remove from array:
    clients.push(client)
    client.on('close', () => clients.splice(clients.indexOf(client), 1))
  }
}

function parseCookies (cookieString) {
  var split_read_cookie = cookieString.split(";");
  var out = {};

  for (let i=0 ; i<split_read_cookie.length;i++){
    let value = split_read_cookie[i].split("=");
    out[_.trim(value[0])] = _.trim(value[1]);
  }

  return out;
}

module.exports = rateLimit;
