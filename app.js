
const env       = process.env.NODE_ENV || "development";
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const auth = require("./auth.js");
console.log("ENV: " + process.env.NODE_ENV);

const app = express();

const apiV1 = require('./routes/apiV1');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'www', 'assets', 'images', 'favicon', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(auth.initialize());

//app.use('/api/v1', auth.authenticateJwt(), apiV1);
app.use('/api/v1', apiV1);
app.post('/login', auth.authenticateUser(), auth.createToken, function(req, res){
  "use strict";
  res.send({ user: req.user, token: req.token});
});
app.use('/', express.static(path.join(__dirname, 'www')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
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

process.on('unhandledRejection', r => console.log(r));

module.exports = app;
