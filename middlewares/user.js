// DB Models
const User = require("../models/user")

// Middleware: check if logged-in user still exists
async function checkUserExists(req, res, next) {
    try {
        const user = await User.findById(req.user._id); // or however you store it
        if (!user.email) {
            console.log("User not exists! MIDDLEWARE")
            return res.render("userProfilePage", {
                user: null, blogs: [], comments: [], commentsOnMyBlogs: [],
                error: "User not exists! MIDDLEWARE"
            });
        }
        next();
    } catch (err) {
        next(err);
    }
}   

module.exports = { 
    checkUserExists
}