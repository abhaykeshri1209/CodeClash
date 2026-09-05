const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis");

const userMiddleware = async (req, res, next) => {
    try {

        const token = req.cookies?.token;

        console.log("TOKEN:", token);

        if (!token) {
            return res.status(401).json({
                message: "Token missing"
            });
        }

        const payload = jwt.verify(
            token,
            process.env.JWT_KEY
        );

        const user = await User.findById(payload._id);

        if (!user) {
            return res.status(401).json({
                message: "User doesn't exist"
            });
        }

        const isBlocked = await redisClient.exists(
            `token:${token}`
        );

        if (isBlocked) {
            return res.status(401).json({
                message: "Token is blocked"
            });
        }

        req.result = user;

        next();

    } catch (err) {

        console.log("AUTH ERROR:", err.message);

        return res.status(401).json({
            message: err.message
        });
    }
};

module.exports = userMiddleware;