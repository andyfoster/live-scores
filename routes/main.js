const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('main/landing');
  // res.send('donkey')
});

router.get('/signup', (req, res, next) => {
  res.send('signup here')
})
router.get('/login', (req, res, next) => {
  res.send('login here')
})

module.exports = router;
