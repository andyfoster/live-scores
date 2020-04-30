const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const expressHbs = require('express-handlebars');
const config = require('./config');

const app = express();

app.engine('.hbs', expressHbs({
  defaultLayout: 'layout',
  extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res, next) => {
  res.send('hello');
});

app.listen(config.PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Running on http://localhost:${config.PORT}`);
  }
});
