const express = require("express")
const path = require("path")
const multer = require("multer")
const Blog = require("../models/blog")
const Comment = require("../models/comment")

const router = express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`/public/uploads`))
    },
    filename: function (req, file, cb) {
        cb(null, path.resolve(`${Date.now()}-${file.originalname}`))
    }
})
const upload = multer({storage: storage})

router.get("/add-new", (req, res) => {
    res.render("addBlogPage", {
        title: req?.query?.title
    })
})


router.post("/add-new", upload.single("coverImg"), async (req, res) => {
    const { title, descriptionBody, coverImg } = req.body

    await Blog.create({
        title,
        description: descriptionBody,
        coverImgURL: req?.file.filename,
        author: req?.user._id
    })

    return res.redirect(`/blog/add-new?title=${encodeURIComponent(title)}`)
})

// Add Comment to DB
router.post("/comment/:blogId", async (req, res) => {
    const { content } = req?.body
    const comment = await Comment.create({
        content,
        blogId: req.params.blogId,
        createdBy: req.user._id
    })
    console.log("Comment Added", comment)

    return res.redirect(`/blog/${req.params.blogId}`)
})

module.exports = router