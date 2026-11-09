const express = require("express")
const User = require("../models/user")
const { restrictToSignedInUsersOnly } = require("../middlewares/authentication")
const multer = require("multer")

const router = express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/public/uploads/profileimages')        
    }, 
    filename: function (req, file, cb) {
        const uploadFileName = `${Date.now()}-${file.originalname}`
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
    res.render("userProfilePage", {
        user: user
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
            password
        })
    } catch (err) {
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

module.exports = router