const router = require("express").Router();
const async = require("async");
const User = require("../models/user");
const Tweet = require("../models/tweet");

router.get("/", (req, res, next) => {
  if (req.user) {
    /**
     * app.get('/test', function (_req, res) {
        Kitten.find({}).then(kittens => {
            res.render('test.hbs', {
                kittens: kittens.map(kitten => kitten.toJSON())
            })
        })
      }); 
     */

    Tweet.find({})
      .sort("-created")
      .lean()
      .populate("owner")
      .exec(function (err, tweets) {
        if (err) return next(err);
        console.log(tweets);
        res.render("main/home", { tweets: tweets });
        // res.render('main/home', {
        //   tweets: tweets.map(tweet => tweet.toJSON()) // TESTING! Wed 20 May
        // });
      });
  } else {
    res.render("main/landing");
  }
});

router.get("/user/:id", (req, res, next) => {
  async.waterfall([
    function (callback) {
      Tweet.find({ owner: req.params.id })
        .lean()
        .populate("owner")
        .exec(function (err, tweets) {
          callback(err, tweets);
        });
    },
    function (tweets, callback) {
      User.findOne({ _id: req.params.id })
        .lean()
        .populate("following")
        .populate("followers")
        .exec(function (err, user) {
          res.render("main/user", { foundUser: user, tweets: tweets });
        });
    },
  ]);
});

router.post("/follow/:id", (req, res, next) => {
  async.parallel(
    [
      function (callback) {
        User.update(
          {
            _id: req.user._id,
            following: { $ne: req.params.id },
          },
          {
            $push: { following: req.params.id },
          },
          function (err, count) {
            callback(err, count);
          }
        );
      },
      function (callback) {
        User.update(
          {
            _id: req.params.id,
            followers: { $ne: req.user._id },
          },
          {
            $push: { followers: req.user._id },
          },
          function (err, count) {
            callback(err, count);
          }
        );
      },
    ],
    function (err, results) {
      if (err) return next(err);
      res.json("success");
    }
  );
});

router.get("/create-new-user", (req, res, next) => {
  // res.send('signup here')
  var user = new User();
  user.email = "todd@email.com";
  user.name = "Todd";
  user.password = "123123";
  user.save(function (err) {
    if (err) return next(err);
    res.json("Successfully created new user");
  });
});

router.get("/login", (req, res, next) => {
  res.render("accounts/login");
});

module.exports = router;
