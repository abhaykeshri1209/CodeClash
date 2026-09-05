const User = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validate = require("../utils/validator");
const redisClient = require("../config/redis");

// ================= REGISTER =================

const register = async (req, res) => {
    try {
        // Validate request data
        validate(req.body);

        const { firstName, emailId, password } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            firstName,
            emailId,
            password: hashedPassword,
            role: "user"
        });

        // Create JWT token
        const token = jwt.sign(
            {
                _id: user._id,
                emailId: user.emailId,
                role: user.role
            },
            process.env.JWT_KEY,
            {
                expiresIn: 60 * 60
            }
        );

        // Data to send to frontend
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        };

        // Store token in cookie
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });

        res.status(201).json({
            user: reply,
            message: "Registered Successfully"
        });

    } catch (err) {
        console.log("REGISTER ERROR:", err);

        res.status(400).json({
            message: err.message
        });
    }
};


// ================= LOGIN =================

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            throw new Error("Invalid Credentials");
        }

        // Find user
        const user = await User.findOne({ emailId });

        // User doesn't exist
        if (!user) {
            throw new Error("Invalid Credentials");
        }

        // Compare password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            throw new Error("Invalid Credentials");
        }

        // Create JWT
        const token = jwt.sign(
            {
                _id: user._id,
                emailId: user.emailId,
                role: user.role
            },
            process.env.JWT_KEY,
            {
                expiresIn: 60 * 60
            }
        );

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        };

        // Store token in cookie
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });

        res.status(200).json({
            user: reply,
            message: "Login Successfully"
        });

    } catch (err) {
        console.log("LOGIN ERROR:", err);

        res.status(401).json({
            message: err.message
        });
    }
};


// ================= LOGOUT =================

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(400).json({
                message: "No token found"
            });
        }

        const payload = jwt.decode(token);

        // Add token to Redis blacklist
        await redisClient.set(`token:${token}`, "Blocked");

        await redisClient.expireAt(
            `token:${token}`,
            payload.exp
        );

        // Clear cookie
        res.cookie("token", "", {
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });

        res.status(200).json({
            message: "Logged Out Successfully"
        });

    } catch (err) {
        console.log("LOGOUT ERROR:", err);

        res.status(503).json({
            message: err.message
        });
    }
};


// ================= ADMIN REGISTER =================

const adminRegister = async (req, res) => {
    try {
        // Validate data
        validate(req.body);

        const { firstName, emailId, password } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const user = await User.create({
            firstName,
            emailId,
            password: hashedPassword,
            role: "admin"
        });

        // Create token
        const token = jwt.sign(
            {
                _id: user._id,
                emailId: user.emailId,
                role: user.role
            },
            process.env.JWT_KEY,
            {
                expiresIn: 60 * 60
            }
        );

        // Cookie
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });

        res.status(201).json({
            message: "Admin Registered Successfully"
        });

    } catch (err) {
        console.log("ADMIN REGISTER ERROR:", err);

        res.status(400).json({
            message: err.message
        });
    }
};


// ================= DELETE PROFILE =================

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "Deleted Successfully"
        });

    } catch (err) {
        console.log("DELETE PROFILE ERROR:", err);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


module.exports = {
    register,
    login,
    logout,
    adminRegister,
    deleteProfile
};