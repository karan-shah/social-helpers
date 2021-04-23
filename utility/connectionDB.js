var Connections = require('../models/Connections')

// load hard-coded data from the dataset
var getConnections = async (userId) => {
    let connections = await Connections.find({ userId })
    return connections
}

// get perticular connection details based on provided connectionID
var getConnection = async (connectionId) => {
    let connection = await Connections.findOne({ connectionId })
    return connection
}

module.exports = {
    getConnection: getConnection,
    getConnections: getConnections
}