const express = require('express'),
    csrf = require('csurf'),
    bodyParser = require('body-parser'),
    router = express.Router();

// setup route middlewares
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })

/* GET home page. */
router.get('/', csrfProtection, function(req, res, next) {
  res.render('index', { csrfToken: req.csrfToken() });
});

module.exports = router;