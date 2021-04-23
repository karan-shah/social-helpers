var express = require('express');
var session = require("express-session");
var mongoose = require("mongoose");

// Initialize the database
mongoose.connect("mongodb+srv://karan:5ATEGbmn8MOCl7as@cluster0.ii0nx.mongodb.net/social-helpers?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var app = express()

app.set('view engine', 'ejs') // setting EJS as view template 
app.use('/assets', express.static('assets')) // serving static assets

var home = require('../controller')
var user = require('../controller/userProfile')

app.use(session({ secret: "Milestone" }))  // setting secret for express session

// custom routes
app.use('/user', user)
app.use('/', home)
app.use('/*', home) // For 404 page

app.listen(process.env.PORT || 3000, function () {
    console.log('server running')
});
