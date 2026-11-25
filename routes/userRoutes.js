const express = require("express")
const { restrictToSignedInUsersOnly } = require("../middlewares/authentication")
const multer = require("multer")

// DB Models
const User = require("../models/user")
const Blog = require("../models/blog")
const Comment = require("../models/comment")

const router = express.Router()

// Object used to set destination and filename for uploading file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/profileimages')        
    }, 
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})
// Object used to upload any file at /public/profileimages path
const upload = multer({storage: storage})

router.get("/signin", (req, res) => {
    res.render("signinPage");
})

router.get("/signup", (req, res) => {
    res.render("signupPage");
})

// User Profile Route + Controller
router.get("/user-profile", restrictToSignedInUsersOnly, async (req, res) => {
    const user = await User.findOne({email: req.user.email});
    const blogs = await Blog.find({author: user._id})
    const comments = await Comment.find({createdBy: user._id})
    const commentsOnMyBlogs = await allCommentsOnBlogs(user._id)

    res.render("userProfilePage", {
        user,
        blogs,
        comments,
        commentsOnMyBlogs
    });
})

// Update User Profile Route + Controller
router.post("/update-user-profile", restrictToSignedInUsersOnly, async (req, res) => {
    const {email, fullName, profileImgURL} = req?.body

    try {
        console.log(email, fullName, profileImgURL)
    } catch (err) {
        console.log(err)
        return res.redirect("/user/user-profile")
    }

    return res.redirect("/user/user-profile")
})

// SignUp Route + Controller
router.post("/signup", upload.single("profileImgURL"), async (req, res) => {
    const { fullName, email, password } = req?.body
    try {
        const result = await User.findOne({email: email})
        if (result)
            return res.render("signupPage", {error: "Email is already registered!"})

        await User.create({
            fullName,
            email,
            password,
            profileImgURL: "/uploads/profileimages/" + req?.file.filename
        })
    } catch (err) {
        console.log(err)
        return res.render("signupPage", {error: err.message})
    }

    return res.redirect("/user/signin")
})

// SingIn Route + Controller
router.post("/signin", async (req, res) => {
    const {email, password} = req?.body
    try {
        const token = await User.matchUserAndGenerateToken(email, password)
        res.cookie("token", token)
        return res.redirect("/")
    } catch (err) {
        console.log(err)
        return res.render("signinPage", {
            "error" : err.message
        })
    }
})

// Logout Route + Controller
router.get("/logout", (req, res) => {
    res.clearCookie("token")
    res.redirect("/")
})


// 
async function allCommentsOnBlogs(userId) {
    const blogIds = await Blog.find({author: userId}).distinct("_id")
    const allCommnets = await Comment.find({blogId: {$in: blogIds}});
    return allCommnets
}

module.exports = router