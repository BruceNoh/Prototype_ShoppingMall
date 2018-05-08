const mongoose = require('mongoose')

const QnASchema = new mongoose.Schema({
  uid: mongoose.Schema.Types.ObjectId,
  name: String,
  category: String,
  email: String,
  phoneNumber: String,
  title: String,
  content: String,
  time: {
    type: Date,
    default: new Date()
    // default: function() {
    //   return new Date().getTime()
    // }
  },
  secret: Boolean,

  answer: Object
})

module.exports = mongoose.model('qnas', QnASchema)
