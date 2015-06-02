
var secrets = require('../config/secrets');
var cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: secrets.cloudinary.cloud_name,
  api_key: secrets.cloudinary.api_key,
  api_secret: secrets.cloudinary.api_secret
});

module.exports = cloudinary;
