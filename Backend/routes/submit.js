const express = require("express");

const submitRouter = express.Router();

const userMiddleware = require("../middleware/userMiddleware");

const {
  submitCode,
  runCode,
  getSubmissionHistory,
} = require("../controllers/userSubmission");


// Submit code
submitRouter.post(
  "/submit/:id",
  userMiddleware,
  submitCode
);


// Run code
submitRouter.post(
  "/run/:id",
  userMiddleware,
  runCode
);


// Submission history
submitRouter.get(
  "/history/:id",
  userMiddleware,
  getSubmissionHistory
);


module.exports = submitRouter;