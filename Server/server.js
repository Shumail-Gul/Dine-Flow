import express from "express"
import path from "path"
import cors from "cors"
import cookieParser from "cookie-parser"
import "dotenv/config"
import connectDB from "./config/db.js"

connectDB()
const app = express()
app.use(express.json)
app.use(
    cors({
        origin : process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true
    })
)
app.use(cookieParser)


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

