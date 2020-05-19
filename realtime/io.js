const async = require('async');
const Tweet = require('../models/tweet');
const User = require('../models/user');

module.exports = function (io) {

  io.on('connection', function (socket) {
    console.log('connected to socket (io.js: 4)');
    let user = socket.request.user;
    console.log(user.name);

    socket.on('tweet', (data) => {
      if (data.content == '') return false;
      async.parallel([
        function (callback) {
          io.emit('incomingTweets', { data, user });

        },
        function (callback) {
          async.waterfall([
            function (callback) {
              let tweet = new Tweet();
              tweet.owner = user._id;
              tweet.content = data.content;
              tweet.save(function (err) {
                callback(err, tweet);
                if (err) return err;
                console.log('success');
              });
            },
            function (tweet, callback) {
              User.updateOne({
                _id: user._id
              }, {
                $push: {
                  tweets: { tweet: tweet._id }
                }
              }, function (err, count) {
                callback(err, count);
              });
            },
          ]);
        }
      ]);

    });
  });
};
