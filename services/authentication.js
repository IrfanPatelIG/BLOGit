const JWT = require("jsonwebtoken")

const config = require("../config")
const secret = config.jwt_secret

function createTokenForUser(user) {
    const userPayload = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        salt: user.salt,
        roel: user.role
    }
    const token = JWT.sign(userPayload, secret)
    return token
}

function validateToken(token) {
    const user = JWT.verify(token, secret)
    return user
}

module.exports = {
    createTokenForUser,
    validateToken
}