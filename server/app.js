require('dotenv').config();
require('./bootstrap')().catch(e => { console.error(e); process.exit(1); });
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const auth = require('./middleware/authMiddleware');

const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());     // parse JSON bodies

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/hello', require('./routes/hello'));
app.use('/auth', require('./routes/auth'));   

app.use('/dashboard', require('./routes/dashboard'));

app.use('/groups', require('./routes/groups'));
app.use('/students', require('./routes/students'));
app.use('/teachers', require('./routes/teachers'));

app.use('/costs', require('./routes/costs'));
app.use('/cost-templates/', require('./routes/costTemplates'));
require('./jobs/costsScheduler'); // Cost generation job

app.use('/registrations',   require('./routes/registrations'));
app.use('/payments',        require('./routes/payments'));
app.use('/teacher-payments', require('./routes/teacherPayments'))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/upload', require('./routes/upload') );

app.use('/group-schedules', require('./routes/groupSchedules'));
app.use('/group-sessions', require('./routes/groupSessions'));
require('./jobs/sessionGenerator');

module.exports = app;
