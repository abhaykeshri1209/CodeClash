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
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin); // helps you debug
        callback(null, false);
      }
    }, // <-- comma was missing here
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