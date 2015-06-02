
var secrets = require('../config/secrets')
var Post = require('../models/post')
var agenda = require('../lib/agenda')
var cloudinary = require('../lib/cloudinary')
var fs = require('fs')
var fbgraph = require('fbgraph')
var _ = require('lodash')
var async = require('async')
var VKSDK = require('vksdk')

exports.index = function (req, res) {
  Post.find({ user_id: req.user.id }, function (err, posts) {
    res.render('posts/index', {
      title: 'Posts',
      posts: posts
    });
  });
}

exports.show = function (req, res) {
  async.parallel({
    getFacebookPages: function(done) {
      var token = _.find(req.user.tokens, { kind: 'facebook' });
      fbgraph.setAccessToken(token.accessToken);

      fbgraph.get("me/accounts?fields=id,name", function(err, accounts) {
        console.log(err);
        done(err, accounts.data);
      });
    },
    getVkontaktePages: function(done) {
      vk = new VKSDK({
        appId: secrets.vkontakte.clientID,
        appSecret: secrets.vkontakte.clientSecret,
        mode: 'oauth'
      });

      var token = _.find(req.user.tokens, { kind: 'vkontakte' });

      console.log(token);
      console.log(req.user.vkontakte);

      vk.request('groups.get', {
        user_id: req.user.vkontakte,
        extended: 1,
        filter: 'moder',
        access_token: token.accessToken
      }, function (result) {

        if (result.error) {
          done(result.error);
        } else {
          done(null, result.response.items);
        }
      });

    },
    getPost: function(done) {
      Post.findOne({ user_id: req.user.id, _id: req.params.id }, function (err, post) {
        done(err, post);
      });
    }
  }, function (err, results) {
    if (err) console.log(err);

    res.render('posts/show', {
      post: results.getPost,
      fb_pages: results.getFacebookPages,
      vk_pages: results.getVkontaktePages,
      cloudinary: cloudinary
    });
  });
}

exports.new = function (req, res) {
  res.render('posts/new', {
    cloudinary: cloudinary
  });
}

exports.create = function (req, res) {

  console.log(req.body);
  var post = new Post({
    title: req.body.post.title,
    body: req.body.post.body,
    user_id: req.user.id,
  });

  var preloaded_file = new cloudinary.PreloadedFile(req.body.post_image);
  if (preloaded_file.is_valid()) {
    post.image_id = preloaded_file.identifier();
  } else {
    throw("Invalid upload signature");
  }

  post.save(function (err) {
    res.redirect('/posts');
  });
}

exports.schedule = function (req, res) {

  console.log(req.body.scheduling)
  console.log(req.body.post_on)

  var scheduling_info = req.body.scheduling;

  agenda.schedule(new Date(scheduling_info.datetime + '+03:00'), 'scheduled post', {
    post_id: req.params.id,
    user_id: req.user.id,
    special: {
      target_fb_page_id: scheduling_info.target_fb_page
    },
    post_on: req.body.post_on || {}
  });
  Post.findByIdAndUpdate(req.params.id, { $set: {scheduled: true}}, function (err, post) {
    res.redirect('/posts/' + req.params.id);
  });
}

exports.edit = function (req, res) {
  res.render('posts/edit');
}

exports.update = function (req, res) {
  res.redirect('/posts');
}

exports.destroy = function (req, res) {
  console.log(req.params.id);
  Post.findOneAndRemove({ user_id: req.user.id, _id: req.params.id }, function (err) {
    console.log(err);
    agenda.cancel({'data.post_id': req.params.id}, function (err, nRemoved) {
      console.log('Removed ' + nRemoved + ' jobs for post_id ' + req.params.id)
    });
    res.redirect('/posts');
  });
}


