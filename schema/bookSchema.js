const {Schema} = require('mongoose');

module.exports = Schema({
  title: {
    type: String,
    required: true,
  },
  comments: {
    type: [String],
    default: [],
  },
})