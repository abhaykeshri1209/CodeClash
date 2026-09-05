const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

async function main() {
  try {
    const conn = await mongoose.connect(process.env.DB_CONNECT_STRING);

    console.log(`MongoDB Connected : ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);

    process.exit(1);
  }
}

module.exports = main;
