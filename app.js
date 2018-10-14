var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var uploadRouter = require('./routes/upload');
var triviaGameRouter = require('./routes/triviaGame');
var concentrationGameRouter = require('./routes/concentrationGame');
var truthLieGameRouter = require('./routes/truthLieGame');
var chatRouter = require('./routes/chat');
var dashboardRouter = require('./routes/dashboard');


var app = express();

var cors = require('cors')
app.use(cors())

mongoose.connect('mongodb+srv://admin_oz:'
  + process.env.MONGO_PSW
  + '@project-cluster-eeufz.mongodb.net/test?retryWrites=true'
  , { useNewUrlParser: true });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.use('/uploads', express.static('uploads'));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'/*http://my-cool-page*/)
  res.header('Access-Control-Allow-headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET', )
    return res.status(200).json({});
  }
  next();
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/upload', uploadRouter);
app.use('/triviaGame', triviaGameRouter);
app.use('/truthLieGame', truthLieGameRouter);
app.use('/concentrationGame', concentrationGameRouter);
app.use('/dashboard', dashboardRouter);
app.use('/chat', chatRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    }
  })
  //res.render('error');
});

module.exports = app;
