const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization
        if(!authHeader){
            return res.status(401).json({
                success : false,
                message: "Access Denied"
            })
        }

        if(!authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                success: false,
                message: "Invalid Format"
            })
        }
        const token = authHeader.split(" ")[1];
        const verified = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.id).select("-password");

        if(!user){
            return res.status(404).json({
                success: true,
                message: "User not found"
            })
        }
        req.user = user
        next();

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }
}

module.exports = auth;