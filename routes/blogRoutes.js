const express = require("express")
const multer = require("multer")

// DB Models
const Blog = require("../models/blog")
const Comment = require("../models/comment")

const router = express.Router()

// Object used to set destination and filename for uploading file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./public/uploads/coverimages`)
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})
// Object used to upload any file at /public/profileimages path
const upload = multer({storage: storage})

// Add new Blog Route
router.get("/add-new", (req, res) => {
    res.render("addBlogPage", {
        user: req?.user,
        title: req?.query?.title
    })
})

// Add new Blog Route + Controller
router.post("/add-new", upload.single("coverImg"), async (req, res) => {
    const { title, descriptionBody } = req.body
    
    await Blog.create({
        title,
        description: descriptionBody,
        coverImgURL: req?.file?.filename && "/uploads/" + req?.file?.filename,
        author: req?.user._id
    })

    return res.redirect(`/blog/add-new?title=${encodeURIComponent(title)}`)
})

// Delete a Blog with blog-id Route + Controller
router.delete("/delete/:blogId", async (req, res) => {
    
})

// Add Comment to DB Route + Controller
router.post("/comment/:blogId", async (req, res) => {
    const { content } = req?.body
    await Comment.create({
        content,
        blogId: req.params.blogId,
        createdBy: req.user._id
    })

    return res.redirect(`/view/blog/${req.params.blogId}`)
})

// Delete a Comment with comment-id Route + Controller
router.get("/comment/delete/:commentId", async (req, res) => {
    const commentId = req?.params.commentId
    
    const comment = await Comment.findOneAndDelete({_id: commentId})
    
    res.redirect(`/view/blog/${comment.blogId}`)
})

module.exports = router