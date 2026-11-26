function checkDBConnectionError(mongoose, err) {
    return function (req, res, next) {
        if (mongoose.connection.readyState === 0) {
            return res.startus(503).render("displayError", {err})
        }
        next()
    }
}

module.exports = {
    checkDBConnectionError
}