const router = require('express').Router();

router.get('/matchup', (req, res, next) => {
  res.render('matchups/matchup');
  // res.send('hi there');
});

module.exports = router;
