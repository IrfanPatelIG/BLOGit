const config = require("./config")
const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const { getReadableFullDate } = require("./services/utilities")
const { checkDBConnectionError } = require("./middlewares/error")

// For Authentication service 
const cookieParser = require("cookie-parser")
const { checkForAuthToken, restrictToSignedInUsersOnly } = require("./middlewares/authentication")

// DB Models
const Blog = require("./models/blog")
const Comment = require("./models/comment")

// Routers
const userRouter = require("./routes/userRoutes")
const blogRouter = require("./routes/blogRoutes")

const app = express()
const PORT = config.port
let errorText

// DB Connection
mongoose.connect(config.mongoUri)
    .then(() => {
        console.log("MongoDB Connected!")
        // Server
        app.listen(PORT, () => {
            console.log(`Server is live: http://localhost:${PORT}`)
        })
    })
    .catch((err) => {
        errorText = err
        console.error("Catched Error:", errorText)
    })


// Views config
app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))

// Middlewares
// app.use(checkDBConnectionError(mongoose, errorText))
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use(checkForAuthToken)
app.use((req, res, next) => {
    res.locals.currentPath = req.path
    next()
})

// Routes
// Home page route
app.get("/", async (req, res) => {
    const user = req?.user
    
    let blogs = await Blog.find({}).populate("author")
    blogs = blogs.sort((a, b) => b.createdAt - a.createdAt)

    res.render("homePage", {
        user,
        blogs,
        getReadableFullDate
    })
})

// About page route
app.get("/about", (req, res) => {
    res.render("aboutPage", {user: req?.user})
})

// All User related routes & Controllers
app.use("/user", userRouter)

// All Blog related routes & Controllers
app.use("/blog", restrictToSignedInUsersOnly, blogRouter)
// View Blog route + controller
app.get("/view/blog/:blogId", async (req, res) => {
    const blogId = req?.params.blogId

    const blog = await Blog.findOne({_id: blogId}).populate("author")
    const comments = await Comment.find({blogId: blog.id}).populate("createdBy")

    res.render("blogPage", {
        user: req?.user,
        blog,
        getReadableFullDate,
        comments
    })
})


// Error displaying Route + Controller
app.get("/error-display/:err", (req, res) => {
    console.log("Display Error: ", req.params.err)
    return res.render("displayError", {
        err: req.params.err
    })
})