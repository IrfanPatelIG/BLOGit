const config = require("./config")
const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")

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


// Routes
app.get("/", (req, res) => {
    res.render("homePage")
})

app.use("/user", userRouter)
app.use("/blog", blogRouter)


// Server
app.listen(PORT, () => {
    console.log(`Server is live: http://localhost:${PORT}`)
})