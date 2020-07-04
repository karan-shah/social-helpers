var Connections = require('../models/Connections')
var UserConnection = require("../models/UserConnection")

var connectionDB = require('./connectionDB')

// Add new connection
var addNewConnection = async (connection) => {
  var newConnection = Connections({ ...connection })
  await newConnection.save((error) => {
    if (error) {
      console.log('failed to add new connection', error)
    }
    else {
      console.log('new connection added')
    }
  })
  var newConnection = UserConnection({
    userId: connection.userId,
    connection,
    rsvp: 'Yes'
  })
  await newConnection.save((error) => {
    if (error) {
      console.log('failed to add new user connection')
    }
    else {
      console.log('new user connection added')
    }
  })
}

// add a connection to user savedConnections list
var addConnection = async (userId, connectionId, rsvp) => {
  var connection = await connectionDB.getConnection(connectionId)
  var newConnection = UserConnection({
    userId,
    connection,
    rsvp
  })
  await newConnection.save((error) => {
    if (error) {
      console.log('failed to add new user connection')
    }
    else {
      console.log('new user connection added')
    }
  })
}

// remove connection from user savedConnections list
var removeConnection = async (userId, connectionId) => {
  await UserConnection.deleteOne({
    userId,
    "connection.connectionId": connectionId
  })
}

// update connection RSVP or add the connection if it's not already added to user savedConnections list
var updateRSVP = async (userId, connectionId, rsvp) => {
  // const connectionDetails = await connectionDB.getConnection(connectionId)
  const userConnectionObj = await getUserConnection(userId, connectionId)
  if (userConnectionObj) {
    await UserConnection.updateOne(userConnectionObj, { rsvp });
  } else {
    await addConnection(userId, connectionId, rsvp)
  }
}

// get count of total going users for a perticular connection.
var getGoingCount = async (connectionId) => {
  const count = await UserConnection.find({ rsvp: 'Yes', 'connection.connectionId': connectionId }).count()
  return count
}

// get a perticular saved connection of the user
var getUserConnection = async (userId, connectionId) => {
  const userConnectionObj = await UserConnection.findOne({ userId, "connection.connectionId": connectionId })
  return userConnectionObj
}

// get all the savedConnections of the user
var getUserConnections = async (userId) => {
  return UserConnection.find({ userId })
}

module.exports = {
  addNewConnection,
  addConnection,
  removeConnection,
  updateRSVP,
  getGoingCount,
  getUserConnections,
  getUserConnection
}