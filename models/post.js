var mongoose = require('mongoose');


var postSchema = new mongoose.Schema({
  title: String,
  body: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  image_id: String
})


module.exports = mongoose.model('Post', postSchema)
