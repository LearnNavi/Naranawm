
process.env.NODE_ENV = "development";

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

console.log("ENV: " + process.env.NODE_ENV);

const rebuildDatabase = true;

if(rebuildDatabase){
    const dictionary = require('./eanaEltuMigration/dictionary');

    dictionary.buildDictionary(function(){
        // We have a full Dictionary now to do things with :)
        //console.log(dictionary.missingEntryTranslations);
        //console.log(dictionary.entries);
        dictionary.export(function(){
            console.log("Export Complete!!!");
            //process.exit(0);
        });
    });
}

const app = express();

const apiV1 = require('./routes/apiV1');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1', apiV1);
app.use('/', express.static(path.join(__dirname, 'app')));

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

module.exports = app;
