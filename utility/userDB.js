var User = require('../models/User');

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

module.exports = {
    // getUser,
    validateUserCredentials
}
