const { Schema, model } = require("mongoose")
const { createHmac, randomBytes } = require("crypto")
const { createTokenForUser } = require("../services/authentication")

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    profileImgURL: {
        type: String,
        default: "/images/defaultProfile.png"
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    }
}, {timestamps: true})

userSchema.pre("save", function () {
    const user = this

    const salt = randomBytes(16).toString()
    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex")

    this.salt = salt
    this.password = hashedPassword
})

userSchema.static("matchUserAndGenerateToken", async function (email, password) {
    const user = await this.findOne({email})
    if (!user)
        throw new Error("Email is Invalid!");
    
    const salt = user.salt
    const hashPassword = randomBytes("sha256", salt)
        .update(password)
        .digest("hex")

    if (hashPassword !== user.password)
        throw new Error("Inccorect Password!")

    const token = await createTokenForUser(user)
    return token
})

const User = model("users", userSchema)

module.exports = User