const express = require('express'),
      path = require('path'),
      ws = require('./ws'),
      app = express(),
      fs = require("fs"),
      https = require("https"),
      http = require('http'),
      forceSsl = require('express-force-ssl'),
      csrf = require('csurf'),
      cookieParser = require('cookie-parser'),
      indexRouter = require('./router.js');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use(forceSsl);
app.set('forceSSLOptions', {
  enable301Redirects: true,
  trustXFPHeader: false,
  httpsPort: 3001,
  sslRequiredMessage: 'SSL Required.'
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

http.createServer(app).listen(3000, function () {
   console.log('HTTP App listening on port 3000')
});

https.createServer({
  key: fs.readFileSync('encryption/key.pem', 'utf8'),
  cert: fs.readFileSync('encryption/cert.pem', 'utf8')
}, app).listen(3001, function () {
   console.log('HTTPS App listening on port 3001')
});
