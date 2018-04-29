var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();
app.get('env') === 'production' || require('./utils/test_env');

// require('./controller/process-list');
// require('./controller/addFavAll');

app.get('env') === 'production' ? app.disable('x-powered-by') : false;
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
app.get('env') !== 'production' ? (app.use(logger('dev'))) : false;
process.env['Twitter_UserId'] = process.env['Access_Token'].split('-')[0];

app.use(cookieParser());

app.use((req, res, next) => {
  if (
    (req.path == '/twitter/account_activity' && req.method == 'POST')
    || (req.path == '/line')
  ) {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});
app.use(bodyParser.urlencoded({extended: false}));
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/line', bodyParser.text({ type: '*/*' }), require('./routes/line'));
app.use('/twitter', require('./routes/twitter'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  err.status != 404 ? console.error(err) : console.error(req.originalUrl);
  var errorMessage = { message: err.message };

  res.status(err.status || 500);
  req.app.get('env') !== 'production' ? (errorMessage.stack = err.stack) : false;
  res.json(errorMessage);
});

module.exports = app;
