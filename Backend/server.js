const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

const main = require("./config/db");
const redisClient = require("./config/redis");

const authRouter = require("./routes/authRoute");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// Routes
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submit", submitRouter);
app.use("/ai", aiRouter);

// Initialize connections
const initializeConnection = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await main();
    console.log("✅ MongoDB Connected");

    console.log("Connecting to Redis...");
    await redisClient.connect();
    console.log("✅ Redis Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Initialization Error:", err);
    process.exit(1);
  }
};

initializeConnection();