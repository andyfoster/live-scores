const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const Hbs = require('hbs');
const Hbs = require('handlebars');
const expressHbs = require('express-handlebars');
// const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');

const config = require('./config');
const app = express();

// create a write stream (in append mode)
let accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.connect(config.mongoDB, function (err) {
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
  secret: config.sessionSecret,
  store: new MongoStore({ url: config.mongoDB, autoReconnect: true })
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

app.use(mainRoutes);
app.use(userRoutes);

app.listen(config.PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Running on http://localhost:${config.PORT}`);
  }
});
