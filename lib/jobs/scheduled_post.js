
var Post = require('../../models/post')
var User = require('../../models/user')
var publisher = {
  facebook: require('../publishers/facebook'),
  twitter: require('../publishers/twitter')
}
var async = require('async')

module.exports = function(agenda) {
  agenda.define('scheduled post', function(job, done) {
    console.log(job)
    var job_data = job.attrs.data

    async.parallel({
      getUser: function(done) {
        User.findById(job_data.user_id, function(err, user) {
          done(err, user);
        });
      },
      getPost: function(done) {
        Post.findById(job_data.post_id, function (err, post) {
          done(err, post);
        })
      }
    },
    function(err, results) {
      if (err) return next(err);

      if (job_data.post_on.facebook) {
        publisher.facebook(
          results.getUser,
          results.getPost,
          job_data.special.target_fb_page_id
        );
      }

      if (job_data.post_on.twitter) {
        publisher.twitter(
          results.getUser,
          results.getPost
        );
      }
    });
  });
}
