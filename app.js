var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
// var OAuth = require('oauthio');
var dbConfig = require('./config/db');
var dbManager= require('./db');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var newUserRouter = require('./routes/newuser');
var createAccountRouter = require('./routes/create')
var userPageRouter = require('./routes/userpage')
var listenerRouter = require('./routes/listener');
var newMessageRouter = require('./routes/newmessage')

var dbUri = dbConfig.dbUri;

var app = express();

//database setup
var MongoClient = require('mongodb').MongoClient;
var url = dbConfig.dbUri+dbConfig.dbName;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db(dbConfig.dbName);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.param('listenerId', function(request, response, next, listenerId) {
  dbManager.getUserWithQuery({listenerId: listenerId}, function(err, result) {
    request.sentToUser = result;
    next();
  });
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/newuser', newUserRouter);
app.use('/create', createAccountRouter);
app.use('/userpage', userPageRouter);
app.use('/listener/:listenerId', listenerRouter);
app.use('/newmessage', newMessageRouter);

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
  // res.render('error');
});

module.exports = app;
