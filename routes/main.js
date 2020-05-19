const router = require('express').Router();
const User = require('../models/user');

router.get('/', (req, res, next) => {
  if (req.user) {
    res.render('main/home');
  } else {
    res.render('main/landing');
  }
});

router.get('/create-new-user', (req, res, next) => {
  // res.send('signup here')
  var user = new User();
  user.email = 'todd@email.com';
  user.name = 'Todd';
  user.password = '123123';
  user.save(function (err) {
    if (err) return next(err);
    res.json('Successfully created new user');
  });
});

router.get('/login', (req, res, next) => {
  res.render('accounts/login');
});

module.exports = router;
