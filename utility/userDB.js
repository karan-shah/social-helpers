var User = require('../models/User');
var Connections = require('../models/Connections')
var { data: connectionsData } = require('../utility/data')

// var getUsers = async () => {
//     var users = await Users.find()
//     return users
// }

// var getUser = async (email) => {
//     const user = await User.findOne({ email });
//     return user;
// };

var validateUserCredentials = async (username, password) => {
    const user = await User.findOne({ username, password })
    return user
}

var createUser = async (userData) => {
    let users = await User.find({})
    const userId = users.length + 1
    var newUser = User({ userId, ...userData })
    await newUser.save((error) => {
        if (error) {
            console.log('failed to add new user', error)
        }
        else {
            console.log('new user added')
            connectionsData.map(async connection => {
                const newConnection = Connections({ ...connection, userId })
                await newConnection.save((error) => {
                    if (error) {
                        console.log('failed to add new user connection- ', error)
                    }
                    else {
                        console.log('new user connection added')
                    }
                })
            })
        }
    })
}

module.exports = {
    validateUserCredentials,
    createUser
}
