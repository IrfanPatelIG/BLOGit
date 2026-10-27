const { Schema, model } = require("mongoose")

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    coverImgURL: {
        type: String,
        dfault: "/images/defaultCoverImg.png"
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "users"
    }
}, {timeseries: true})

const Blog = model("blogs", blogSchema)

module.exports = Blog