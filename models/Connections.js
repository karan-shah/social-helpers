var mongoose = require("mongoose");

var connectionSchema = new mongoose.Schema({
    userId: {
        type: String, required: true
    },
    connectionId: {
        type: String, required: true
    },
    name: {
        type: String, required: true
    },
    topic: {
        type: String, required: true
    },
    detail: { type: String },
    date: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
    location: { type: String },
    hostedBy: { type: String },
    speaker: { type: String }
})

module.exports = mongoose.model("Connections", connectionSchema);