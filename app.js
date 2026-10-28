const config = require("./config")
const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const { checkForAuthToken, restrictToSignedInUsersOnly } = require("./middlewares/authentication")
const { getReadableFullDate } = require("./services/utilities")
const Blog = require("./models/blog")
const Comment = require("./models/comment")

// Routers
const userRouter = require("./routes/userRoutes")
const blogRouter = require("./routes/blogRoutes")

const app = express()
const PORT = config.port

// DB Connection
mongoose.connect(config.mongoUri)
    .then(() => console.log("MongoDB Connected!"))
    .catch(() => console.log("Fail to Connect to MongoDB!"))

// Views config
app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))

// Middlewares
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use(checkForAuthToken)
app.use((req, res, next) => {
    res.locals.currentPath = req.path
    next()
})

// Routes
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

app.use("/user", userRouter)

app.use("/blog", restrictToSignedInUsersOnly, blogRouter)
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


// Server
app.listen(PORT, () => {
    console.log(`Server is live: http://localhost:${PORT}`)
})