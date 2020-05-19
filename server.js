const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const Hbs = require('hbs'); // replaced with handlebars
const Hbs = require('handlebars');
const expressHbs = require('express-handlebars');
// const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const fs = require('fs');
const path = require('path');
const passportSocketIo = require('passport.socketio');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');

const PORT = 8080;
const secrets = require('./config/secrets');
const SESSION_STORE = new MongoStore({
  url: secrets.mongoDB,
  autoReconnect: true
});

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
require('./realtime/io')(io);

// create a write stream (in append mode)
let accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');
const matchupRoutes = require('./routes/matchup');

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.connect(secrets.mongoDB, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Connected to DB`);
  }
});

const hbs = expressHbs.create({
  defaultLayout: 'layout',
  extname: 'hbs',
  // hbs: allowInsecurePrototypeAccess(Hbs),
});

// app.engine('hbs', expressHbs.create({
//   defaultLayout: 'layout',
//   extname: 'hbs',
//   hbs: allowInsecurePrototypeAccess(Hbs),
// }));
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev', { stream: accessLogStream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  store: SESSION_STORE
}));
app.use(flash());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  if (req.user) {
    res.locals.user = req.user.toObject();
  }
  next();
});

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'connect.sid',
  secret: secrets.sessionSecret,
  store: SESSION_STORE,
  success: onAuthorizeSuccess,
  fail: onAuthorizeFail,
}));

function onAuthorizeSuccess(data, accept) {
  console.log('Successful authorization connection (socket.io)');
  accept();
}

function onAuthorizeFail(data, message, error, accept) {
  console.log('Failed authorization (socket.io)');
  if (error) accept(new Error(message));
}

app.use(mainRoutes);
app.use(userRoutes);
app.use(matchupRoutes);

http.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Running on http://localhost:${PORT}`);
  }
});
