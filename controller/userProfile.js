var express = require('express')
var bodyParser = require("body-parser");
var { check, validationResult } = require("express-validator");
var moment = require('moment')

var router = express.Router()
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var userProfileModel = require('../models/UserProfile')
var userProfileDB = require("../utility/userProfileDB")
var userDB = require('../utility/userDB')

var constants = require('../utility/constants') // for TOPIC value

// User's Saved Connections Page
router.get('/saved-connections', async function (req, res) {
    if (req.session.isUserLoggedIn) {
        let savedConnections = await userProfileDB.getUserConnections(req.session.theUser.userId)
        req.session.currentProfile = savedConnections
        res.render('savedConnections', {
            savedConnections: savedConnections,
            currentUser: req.session.theUser || {},
            isUserLoggedIn: req.session.isUserLoggedIn || false,
            TOPICS: constants.topics
        })
    } else {
        res.redirect('/user/login')
    }
})

// Update user RSVP for a connection
router.get('/update-connection/rsvp', function (req, res) {
    if (req.session.isUserLoggedIn) {
        if (req.query) {
            const { connectionId, rsvp } = req.query
            if (rsvp === 'Yes' || rsvp === 'No' || rsvp === 'Maybe') {
                let userId = req.session.theUser.userId
                userProfileDB.updateRSVP(userId, connectionId, rsvp)
            }
        }
        res.redirect('/user/saved-connections')
    } else {
        res.redirect('/user/login')
    }
})

// Delete a connection of the user
router.get('/update-connection/delete', function (req, res) {
    if (req.session.isUserLoggedIn) {
        if (req.query) {
            const { connectionId } = req.query
            let userId = req.session.theUser.userId
            userProfileDB.removeConnection(userId, connectionId)
        }
        res.redirect('/user/saved-connections')
    } else {
        res.send('Please login to continue.')
    }
})

router.get('/login', function (req, res) {
    const { theUser, isUserLoggedIn, loginInputErrors, loginInputValues } = req.session
    // const { errors, values } = req.query
    if (isUserLoggedIn) {
        res.redirect('/user/saved-connections')
    } else {
        res.render('login', {
            currentUser: theUser,
            isUserLoggedIn,
            errors: loginInputErrors || [],
            values: loginInputValues || {}
        })
    }
})

// Login POST Request(initiate session with user data)
router.post('/login', urlencodedParser, [
    check("username")
        .not()
        .isEmpty()
        .withMessage("Username is required")
        .isAlpha()
        .withMessage('Username must only contain letters'),
    check("password")
        .not()
        .isEmpty()
        .withMessage("Password is required")
        .isLength(6)
        .withMessage("Please enter minimum 6 characters")
        .isAlphanumeric()
        .withMessage('Password must only contain letters and numbers')
], async function (req, res) {
    const { username, password } = req.body
    const errors = validationResult(req)
    const values = { username, password }
    if (!errors.isEmpty()) {
        const minimal_errors = errors.array().map(error => { return { msg: error.msg, param: error.param } })
        req.session.loginInputErrors = minimal_errors
        req.session.loginInputValues = values
        res.redirect('/user/login')
    } else {
        const user = await userDB.validateUserCredentials(username, password)
        if (user) {
            req.session.isUserLoggedIn = true
            req.session.theUser = user
            req.session.userProfile = new userProfileModel()
            req.session.loginInputErrors = []
            req.session.loginInputValues = {}
            res.redirect('/user/saved-connections')
        } else {
            req.session.loginInputErrors = [{ param: 'other', msg: 'Username or password are incorrect. Please try again.' }]
            req.session.loginInputValues = values
            res.redirect('/user/login')
        }
    }
})

// Create new connection Page
router.get('/new-connection', function (req, res) {
    const { isUserLoggedIn, newConnectionInputErrors, newConnectionInputValues } = req.session
    // const { } = req.query
    if (isUserLoggedIn) {
        res.render('newConnection', {
            currentUser: req.session.theUser,
            isUserLoggedIn: req.session.isUserLoggedIn,
            errors: newConnectionInputErrors || [],
            values: newConnectionInputValues || {}
        })
    } else {
        res.redirect('/user/login')
    }
})

const validateTime = (startTime, endTime) => {
    return moment(endTime, 'HH:mm').isAfter(moment(startTime, 'HH:mm'))
}

router.post('/new-connection', urlencodedParser,
    check("topic")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Topic is required")
        .matches(/^[A-Za-z_]*$/)
        .withMessage('Topic must only contain letters and _'),
    check("name")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Name is required")
        .matches(/^[A-Za-z\s]*$/)
        .withMessage('Name must only contain letters'),
    check("detail")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Detail is required")
        .isLength({ min: 5 })
        .withMessage('Details must have atleast 5 characters'),
    check("location")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Location is required")
        .matches(/^[A-Za-z0-9,\s]*$/)
        .withMessage('Location must only contain letters and numbers and ,'),
    check("date")
        .not()
        .isEmpty()
        .withMessage("Date is required")
        .custom((date) => {
            if (moment(date).isBefore(moment())) {
                throw new Error('Date must be after today\'s date')
            } else {
                return true
            }
        }),
    check("startTime")
        .not()
        .isEmpty()
        .withMessage("Start Time is required"),
    check("endTime")
        .not()
        .isEmpty()
        .withMessage("End Time is required")
        .custom((endTime, { req }) => {
            if ((req.body.startTime && endTime) && !validateTime(req.body.startTime, endTime)) {
                throw new Error('End Time should be after Start Time')
            }
            else {
                return true
            }
        }),
    async function (req, res) {
        const { isUserLoggedIn, theUser: user } = req.session
        const { topic, name, detail, location, date, startTime, endTime } = req.body
        if (isUserLoggedIn) {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const values = { topic, name, detail, location, date, startTime, endTime }
                const minimal_errors = errors.array().map(error => { return { msg: error.msg, param: error.param, value: error.value } })
                req.session.newConnectionInputErrors = minimal_errors
                req.session.newConnectionInputValues = values
                res.redirect('/user/new-connection')
            } else {
                const connection = {
                    userId: user.userId, connectionId: name.split(' ').join('-').toLowerCase(), topic, name, detail,
                    location, date, startTime, endTime, hostedBy: user.firstName + ' ' + user.lastName
                }
                await userProfileDB.addNewConnection(connection)
                req.session.newConnectionInputErrors = []
                req.session.newConnectionInputValues = {}
                res.redirect('/user/saved-connections')
            }
        } else {
            res.redirect('/user/login')
        }
    })

// Logout(clear session data)
router.get('/logout', function (req, res) {
    if (req.session.theUser) {
        req.session.destroy()
    }
    res.redirect('/')
})

module.exports = router