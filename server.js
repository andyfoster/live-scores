const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const expressHbs = require('express-handlebars');
const session = require('express-session');
const flash = require('express-flash');
const MongoStore = require('connect-mongo')(session);

const config = require('./config');
const app = express();

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

app.engine('.hbs', expressHbs({
  defaultLayout: 'layout',
  extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.sessionSecret,
  store: new MongoStore({ url: config.mongoDB, autoReconnect: true })
}));
app.use(flash());

app.use(mainRoutes);
app.use(userRoutes);

app.listen(config.PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Running on http://localhost:${config.PORT}`);
  }
});
