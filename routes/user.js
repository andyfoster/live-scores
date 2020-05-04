const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport');
const User = require('../models/user');

router.route('/signup')
  .get((req, res, next) => {
    res.render('accounts/signup', { message: req.flash('errors') });
  })
  .post((req, res, next) => {
    if (req.body.name === '' || req.body.email === '' || req.body.password === '') {
      req.flash('errors', `Please don't leave any fields blank`);
      res.redirect('/signup');
    }
    User.findOne({ email: req.body.email }, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', 'An account with that email address already exists. Please login.');
        res.redirect('/signup');
      } else {
        let user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.photo = user.gravatar();
        user.password = req.body.password;
        user.save(function (err) {
          req.logIn(user, function (err) {
            if (err) return next(err);
            res.redirect('/');
          });
        });
      }
    });
  });

router.route('/login')
  .get((req, res, next) => {
    if (req.user) return res.redirect('/');
    res.render('accounts/login', { message: req.flash('loginMessage') });
  })
  .post(passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }));

router.route('/logout')
  .get((req, res, next) => {
    req.logout();
    res.redirect('/');
  });

module.exports = router;
