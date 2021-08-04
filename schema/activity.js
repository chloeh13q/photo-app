"use strict";

var mongoose = require('mongoose');

var activitySchema = new mongoose.Schema({
  activity: String,
  date_time: Date,
  user_id: mongoose.Schema.Types.ObjectId,
  photo_id: {type: mongoose.Schema.Types.ObjectId, default: null},
  comment_id: {type: mongoose.Schema.Types.ObjectId, default: null},
  comment: {type: String, default: null}
})

var Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;