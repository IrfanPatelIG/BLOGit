const express = require("express")
const User = require("../models/user")

const router = express.Router()

router.get("/signin", (req, res) => {
    res.render("signinPage")
})

router.get("/signup", (req, res) => {
    res.render("signupPage")
})


router.post("/signup", async (req, res) => {
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

module.exports = router