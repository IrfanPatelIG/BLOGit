const { validateToken } = require("../services/authentication")

function checkForAuthToken(req ,res, next) {
    const token = req?.cookies["token"]
    if (!token)
        return next()

    const user = validateToken(token)
    req.user = user
    return next()
}

function restrictToSignedInUsersOnly(req, res, next) {
    const token = req?.cookies["token"]
    if (!token)
        return res.render("signinPage", {error: "Unauthorized User!, Please SignIn first.", user: ""})

    const user = validateToken(token)
    req.user = user
    return next()
}

module.exports = {
    checkForAuthToken,
    restrictToSignedInUsersOnly
}