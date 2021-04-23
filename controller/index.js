var express = require('express')
var moment = require('moment')
var { groupBy } = require('lodash')

var router = express.Router()

var connectionDb = require("../utility/connectionDB")
var userProfileDB = require('../utility/userProfileDB')
var constants = require('../utility/constants') // for TOPIC value

// Connections list Page
router.get('/connections', function (req, res) {
    if (req.session.isUserLoggedIn) {
        connectionDb.getConnections(req.session.theUser.userId).then(connections => {
            if (Object.keys(connections).length > 0) { // Checking if there are any connections available
                res.render('connections', {
                    connections: groupBy(connections, (connection) => connection.topic),
                    TOPICS: constants.topics,
                    currentUser: req.session.theUser,
                    isUserLoggedIn: req.session.isUserLoggedIn
                })
            } else {
                res.send('No connections')
            }
        })
    } else {
        res.redirect('/user/login')
    }
})

// Connection Details Page
router.get('/connection', async function (req, res) {
    const { connectionId } = req.query
    if (req.session.isUserLoggedIn) {
        if (connectionId && /^[A-Za-z-]*$/.test(connectionId)) { // validating connectionId passed in the query
            // Fetching perticular connection details from connection ID provided in the query
            const connection = await connectionDb.getConnection(connectionId)
            const count = await userProfileDB.getGoingCount(connectionId)
            var user = req.session.theUser
            let rsvp = undefined
            if (user && connection) {
                const userConnectionObj = await userProfileDB.getUserConnection(user.userId, connection.connectionId)
                if (userConnectionObj) {
                    rsvp = userConnectionObj.rsvp
                }
            }
            if (connection) {
                res.render('connection', {
                    connection, date: moment(connection.date).format('dddd, Qo MMMM, YYYY'),
                    startTime: moment(connection.startTime, 'HH:mm').format('hh:mm A'),
                    endTime: moment(connection.endTime, 'HH:mm').format('hh:mm A'),
                    rsvp, count,
                    currentUser: req.session.theUser,
                    isUserLoggedIn: req.session.isUserLoggedIn
                })
            } else { // If there are no connections of the connectionID provided in the query
                res.send('No record found for the requested connection ID')
            }
        } else {
            // res.send('No connection ID is provided, please try again by providing a connection ID')

            // Redirecting to the connections list as no connectionID parameter passed in the query.
            res.redirect('/connections')
        }
    } else {
        res.redirect('/user/login')
    }
})

// About Page
router.get('/about', function (req, res) {
    res.render('about', {
        currentUser: req.session.theUser,
        isUserLoggedIn: req.session.isUserLoggedIn
    })
})

// Contact Page
router.get('/contact', function (req, res) {
    res.render('contact', {
        currentUser: req.session.theUser,
        isUserLoggedIn: req.session.isUserLoggedIn
    })
})

// Home Page
router.get('/', function (req, res) {
    res.render('index', {
        currentUser: req.session.theUser,
        isUserLoggedIn: req.session.isUserLoggedIn
    })
})

// 404 Page
router.get('/*', function (req, res) {
    res.send('Oops, 404! Page not found')
})

module.exports = router