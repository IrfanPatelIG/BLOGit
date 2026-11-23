const express = require("express")
const User = require("../models/user")
const { restrictToSignedInUsersOnly } = require("../middlewares/authentication")
const multer = require("multer")
const Blog = require("../models/blog")
const Comment = require("../models/comment")

const router = express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/profileimages')        
    }, 
    filename: function (req, file, cb) {
        const uploadFileName = `${Date.now()}-${file.originalname}`
        console.log("UploadFIleName USER", uploadFileName)
        cb(null, uploadFileName)
    }
})

const upload = multer({storage: storage})

router.get("/signin", (req, res) => {
    res.render("signinPage");
})

router.get("/signup", (req, res) => {
    res.render("signupPage");
})

router.get("/user-profile", restrictToSignedInUsersOnly, async (req, res) => {
    const user = await User.findOne({email: req.user.email});
    
    const blogs = await Blog.find({author: user._id})
    const comments = await Comment.find({createdBy: user._id})

    const commentsOnMyBlogs = await allCommentsOnBlogs(user._id)

    console.log("Commnets on my blogs:", commentsOnMyBlogs);
    res.render("userProfilePage", {
        user,
        blogs,
        comments,
        commentsOnMyBlogs
    });
})


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