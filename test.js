
var http = require('http');
var base64 = require('base64-stream');
var async = require('async');
var Promise = require('promise')
var Twit = require('twit')


var getImage = function() {
  return new Promise(function (resolve, reject) {
    var img = 'http://res.cloudinary.com/russudorin/image/upload/v1432673601/s9qaovhr6boqohaifaxi.jpg';
    var bufs = [];
    var buf;

    http.get(img, function(res) {
      if (res.statusCode === 200) {
        res.pipe(base64.encode()).on('data', function(part){
          bufs.push(part)
        }).on('end', function() {
          resolve(Buffer.concat(bufs).toString());
        });
      }
    });
  });
}

var T = new Twit({
    consumer_key: secrets.twitter.consumerKey,
    consumer_secret: secrets.twitter.consumerSecret,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });


var postImage = function (imageData) {
  T.post('media/upload', { media: imageData }, function (err, data, response) {

    var mediaIdStr = data.media_id_string
    var params = { status: 'Test status', media_ids: [mediaIdStr] }

    T.post('statuses/update', params, function (err, data, response) {
      console.log(data);
    });
  });
}

getImage().then(postImage);
