import jsonwebtoken from "jsonwebtoken"
import User from "../models/User.js"

// verify if user has valid token

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        
        return res.status(401).json({message: "Access Denied. No Token Provided."})
    }

    try{
    
        const decoded = Jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select("-password")
    
    if(!user){
        return res.status(401).json({message : "Not Authorized, user not found"})

        req.user = user;
        next()

    } }catch(err){
        return res.status(403).json({message : "Not Authorized, invalid Token"})

    }
}

// Restricts a route to specific roles

export const requireRole =  (...roles) => {
    return (req, res , next) => {
if(!req.user || !roles.includes(req.user.role)){
    return res.status(403).json({message : "Forbidden : Insufficient permissions "})
}
next()
    }
}

