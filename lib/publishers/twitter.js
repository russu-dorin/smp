
var _ = require('lodash')
var http = require('http');
var base64 = require('base64-stream');
var async = require('async');
var Promise = require('promise')
var Twit = require('twit')
var cloudinary = require('../cloudinary')
var secrets = require('../../config/secrets')


module.exports = function (user, post) {
  var getImage = function () {
    return new Promise(function (resolve, reject) {
      var bufs = [];
      var buf;

      var image_url = cloudinary.url(post.image_id)

      http.get(image_url, function(res) {
        if (res.statusCode === 200) {
          res.pipe(base64.encode()).on('data', function(part){
            bufs.push(part)
          }).on('end', function() {
            resolve(Buffer.concat(bufs).toString());
          });
        } else {
          reject('Could not get the image from cloudinary!')
        }
      });
    });
  }

  var tweetPost = function (imageData) {
    var token = _.find(user.tokens, { kind: 'twitter' });
    var T = new Twit({
      consumer_key: secrets.twitter.consumerKey,
      consumer_secret: secrets.twitter.consumerSecret,
      access_token: token.accessToken,
      access_token_secret: token.tokenSecret
    });

    T.post('media/upload', { media: imageData }, function (err, data, response) {
      var mediaIdStr = data.media_id_string
      var params = { status: post.body, media_ids: [mediaIdStr] }

      T.post('statuses/update', params, function (err, data, response) {
        console.log(data);
      });
    });
  }

  getImage().then(tweetPost).catch(function (err) {
    console.log(err);
  })
}
