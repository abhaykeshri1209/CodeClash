const express = require("express");

const Authroute = express.Router();

const {
    register,
    login,
    adminRegister,
    logout,
} = require("../controllers/userAuthent");

const userMiddleware = require("../middleware/userMiddleware");

Authroute.post("/register", register);

Authroute.post("/login", login);

Authroute.post("/logout", userMiddleware, logout);

Authroute.post("/admin/register", adminRegister);

Authroute.get("/check", userMiddleware, (req, res) => {

    const user = req.result;

    const reply = {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role
    };

    res.status(200).json({
        user: reply,
        message: "Valid User"
    });
});

module.exports = Authroute;