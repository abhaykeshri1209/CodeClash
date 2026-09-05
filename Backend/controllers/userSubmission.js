const Problem = require("../models/problem");
const Submission = require("../models/submission");

const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");

// =========================
// SUBMIT CODE
// =========================

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!userId || !code || !problemId || !language) {
      return res.status(400).json({
        message: "Some field missing",
      });
    }

    console.log("LANGUAGE:", language);

    // Find problem
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    // Create submission
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length,
    });

    // Get language
    const languageId = getLanguageById(language);

    console.log("LANGUAGE ID:", languageId);

    if (!languageId) {
      submittedResult.status = "error";
      submittedResult.errorMessage = "Invalid language";
      await submittedResult.save();

      return res.status(400).json({
        message: "Invalid language",
      });
    }

    // Prepare hidden test cases
    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    console.log("SUBMISSIONS:", submissions);

    // Submit code
    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map(
      (value) => value.token
    );

    console.log("TOKENS:", resultToken);

    // Get results
    const testResult = await submitToken(resultToken);

    console.log("TEST RESULT:", testResult);

    // Calculate result
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;

    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;

        runtime += Number(test.executionTime) || 0;

        memory = Math.max(
          memory,
          Number(test.memoryUsed) || 0
        );
      } else {
        if (test.status_id === 4) {
          status = "error";
        } else {
          status = "wrong";
        }

        errorMessage =
          test.stderr ||
          test.exception ||
          "Test case failed";

        // Stop checking once a test fails
        break;
      }
    }

    // Update submission
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;

    submittedResult.runtime = Number(runtime) || 0;
    submittedResult.memory = Number(memory) || 0;

    await submittedResult.save();

    // Only mark problem solved if accepted
    if (status === "accepted") {
      if (!req.result.problemSolved.includes(problemId)) {
        req.result.problemSolved.push(problemId);
        await req.result.save();
      }
    }

    return res.status(201).json({
      accepted: status === "accepted",
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime: Number(runtime) || 0,
      memory: Number(memory) || 0,
      error: errorMessage,
    });

  } catch (err) {
    console.error("SUBMIT ERROR:", err);

    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


// =========================
// RUN CODE
// =========================

const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!userId || !code || !problemId || !language) {
      return res.status(400).json({
        message: "Some field missing",
      });
    }

    console.log("RUN LANGUAGE:", language);

    // Find problem
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    // Get language
    const languageId = getLanguageById(language);

    console.log("LANGUAGE ID:", languageId);

    if (!languageId) {
      return res.status(400).json({
        message: "Invalid language",
      });
    }

    // Prepare visible test cases
    const submissions = problem.visibleTestCases.map(
      (testcase) => ({
        source_code: code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      })
    );

    console.log("SUBMISSIONS:", submissions);

    // Submit code
    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map(
      (value) => value.token
    );

    console.log("TOKENS:", resultToken);

    // Get results
    const testResult = await submitToken(resultToken);

    console.log("TEST RESULT:", testResult);

    // Calculate result
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;

    let success = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;

        runtime += Number(test.executionTime) || 0;

        memory = Math.max(
          memory,
          Number(test.memoryUsed) || 0
        );
      } else {
        success = false;

        errorMessage =
          test.stderr ||
          test.exception ||
          "Test case failed";

        break;
      }
    }

    return res.status(200).json({
      success,
      testCases: testResult,
      passedTestCases: testCasesPassed,
      totalTestCases: problem.visibleTestCases.length,
      runtime: Number(runtime) || 0,
      memory: Number(memory) || 0,
      error: errorMessage,
    });

  } catch (err) {
    console.error("RUN ERROR:", err);

    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


// =========================
// SUBMISSION HISTORY
// =========================

const getSubmissionHistory = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    if (!userId || !problemId) {
      return res.status(400).json({
        message: "User ID or Problem ID missing",
      });
    }

    const submissions = await Submission.find({
      userId,
      problemId,
    })
      .sort({ createdAt: -1 })
      .select("-code");

    return res.status(200).json(submissions);

  } catch (err) {
    console.error("HISTORY ERROR:", err);

    return res.status(500).json({
      message: "Failed to fetch submission history",
      error: err.message,
    });
  }
};


// =========================
// EXPORT
// =========================

module.exports = {
  submitCode,
  runCode,
  getSubmissionHistory,
};


//     language_id: 54,
//     stdin: '2 3',
//     expected_output: '5',
//     stdout: '5',
//     status_id: 3,
//     created_at: '2025-05-12T16:47:37.239Z',
//     finished_at: '2025-05-12T16:47:37.695Z',
//     time: '0.002',
//     memory: 904,
//     stderr: null,
//     token: '611405fa-4f31-44a6-99c8-6f407bc14e73',