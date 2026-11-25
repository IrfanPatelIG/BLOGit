const { validateToken } = require("../services/authentication")

// A middleware that checks for user login, if yes then, set req.user to actual user data 
function checkForAuthToken(req ,res, next) {
    const token = req?.cookies["token"]
    if (!token)
        return next()

    const user = validateToken(token)
    req.user = user
    return next()
}

// A middleware that does same as checkForAuthToken function but it is strict to only LoggedIn Users, if user is not LoggedIn then it gives an error and send user to SignIn page 
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