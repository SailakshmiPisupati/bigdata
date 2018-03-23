# Security Vulnerabilities in Websockets & Mitigation Strategies
### A course project for Big Data & Security (CMSC 691)

## Websocket vulnerabilities
- Cross-Site Request Forgery (CSRF)
- Cross-Site Scripting (XSS)
- Denial of Service (DoS)

## Websocket attack mitigation strategies
- Same origin policy
- Reuse HTTP Cookies
- JWT (JSON Web Tokens)
- WSS (WS over SSL)
- Rate Limiting

## Links
- https://github.com/websockets/ws

## NodeJS debugger
``` bash
# add this line before whichever line(s) you want to debug
debugger;

# Now, start the server
npm run inspect

```

## Creating SSL over NodeJS

#### Create the SSL Certificate : 

Run the following command to create the certificates

```
mkdir encryption
openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
```

#### Enter the details prompted

Enable the SSL Experimenter : //chrome:/flags
	Enable TSL13

### WSS in NodeJS

The wss request headers are not shown in Chrome. Use Firefox to test the wss implementation.
