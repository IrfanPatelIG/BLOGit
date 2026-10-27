require("dotenv").config()

const config = {
    port: process.env.PORT || 6001,
    mongoUri: process.env.MONGODB_URI,
    jwt_secret: process.env.JWT_SECRET
}

// Fail fast on missing critical vars
const required = ['mongoUri', 'jwt_secret'];
for (const key of required) {
  if (!config[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

module.exports = config