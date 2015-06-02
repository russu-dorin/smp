
var fbgraph = require('fbgraph')
var _ = require('lodash')
var cloudinary = require('../cloudinary')

module.exports = function (user, post, targed_page_id) {
  var token = _.find(user.tokens, { kind: 'facebook' });
  fbgraph.setAccessToken(token.accessToken);

  fbgraph.get("me/accounts", function(err, accounts) {
    var page = _.find(accounts.data, { id: targed_page_id });
    fbgraph.setAccessToken(page.access_token);

    fbgraph.post(targed_page_id + "/photos", {
      caption: post.body,
      url: cloudinary.url(post.image_id)
    }, function (err, result) {
      console.log(result);
    });
  });
}
