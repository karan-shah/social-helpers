var mongoose = require("mongoose");

var userProfileSchema = new mongoose.Schema({
    user: {
        type: Object, required: true
    },
    connection: {
        type: Object, required: true
    }
})

module.exports = mongoose.model('UserProfile', userProfileSchema)
