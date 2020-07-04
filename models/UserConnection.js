var mongoose = require("mongoose");

var userConnectionSchema = new mongoose.Schema({
    userId: String,
    connection: {
        type: Object, required: true
    },
    rsvp: {
        type: Object, required: true
    }
})

module.exports = mongoose.model('UserConnection', userConnectionSchema)