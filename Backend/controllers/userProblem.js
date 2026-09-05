const {
    getLanguageById,
    submitBatch,
    submitToken
} = require("../utils/problemUtility");

const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");


// ================= CREATE PROBLEM =================

const createProblem = async (req, res) => {

    try {

        console.log("========== CREATE PROBLEM ==========");
        console.log("BODY:", JSON.stringify(req.body, null, 2));

        const {
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution
        } = req.body;


        // Check required fields
        if (
            !title ||
            !description ||
            !difficulty ||
            !tags ||
            !visibleTestCases ||
            !hiddenTestCases ||
            !startCode ||
            !referenceSolution
        ) {
            return res.status(400).json({
                message: "Some required fields are missing"
            });
        }


        // ================= TEST REFERENCE SOLUTIONS =================

        for (const { language, completeCode } of referenceSolution) {

            console.log("LANGUAGE:", language);
            console.log("COMPLETE CODE:", completeCode);

            const languageId = getLanguageById(language);

            console.log("LANGUAGE ID:", languageId);


            if (!languageId) {
                return res.status(400).json({
                    message: `Invalid language: ${language}`
                });
            }


            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));


            console.log("SUBMISSIONS:", submissions);


            const submitResult = await submitBatch(submissions);

            console.log("SUBMIT RESULT:", submitResult);


            if (!submitResult || submitResult.length === 0) {
                return res.status(400).json({
                    message: `Judge0 submission failed for ${language}`
                });
            }


            const resultToken = submitResult.map(
                (value) => value.token
            );


            console.log("TOKENS:", resultToken);


            const testResult = await submitToken(resultToken);

            console.log("TEST RESULT:", testResult);


            for (const test of testResult) {

                if (test.status_id !== 3) {

                    console.log(
                        "TEST FAILED:",
                        test
                    );

                    return res.status(400).json({
                        message: `Reference solution failed for ${language}`
                    });
                }
            }
        }


        // ================= SAVE PROBLEM =================

        const userProblem = await Problem.create({

            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,

            problemCreator: req.result._id
        });


        console.log("PROBLEM CREATED:", userProblem._id);


        return res.status(201).json({
            message: "Problem Saved Successfully",
            problem: userProblem
        });

    }

    catch (err) {

        console.error("🔥 CREATE PROBLEM ERROR:");
        console.error(err);

        return res.status(500).json({
            message: err.message
        });
    }
};



// ================= UPDATE PROBLEM =================

const updateProblem = async (req, res) => {

    const { id } = req.params;

    try {

        if (!id) {
            return res.status(400).json({
                message: "Missing ID Field"
            });
        }


        const DsaProblem = await Problem.findById(id);


        if (!DsaProblem) {
            return res.status(404).json({
                message: "Problem is not present in server"
            });
        }


        const {
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution
        } = req.body;


        // ================= TEST REFERENCE SOLUTIONS =================

        for (const { language, completeCode } of referenceSolution) {

            console.log("UPDATE LANGUAGE:", language);

            const languageId = getLanguageById(language);

            console.log("UPDATE LANGUAGE ID:", languageId);


            if (!languageId) {
                return res.status(400).json({
                    message: `Invalid language: ${language}`
                });
            }


            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));


            const submitResult = await submitBatch(submissions);


            if (!submitResult || submitResult.length === 0) {
                return res.status(400).json({
                    message: `Judge0 submission failed for ${language}`
                });
            }


            const resultToken = submitResult.map(
                (value) => value.token
            );


            const testResult = await submitToken(resultToken);


            for (const test of testResult) {

                if (test.status_id !== 3) {

                    return res.status(400).json({
                        message: `Reference solution failed for ${language}`
                    });
                }
            }
        }


        // ================= UPDATE DATABASE =================

        const newProblem = await Problem.findByIdAndUpdate(
            id,
            {
                title,
                description,
                difficulty,
                tags,
                visibleTestCases,
                hiddenTestCases,
                startCode,
                referenceSolution
            },
            {
                runValidators: true,
                new: true
            }
        );


        return res.status(200).json({
            message: "Problem Updated Successfully",
            problem: newProblem
        });

    }

    catch (err) {

        console.error("🔥 UPDATE PROBLEM ERROR:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};



// ================= DELETE PROBLEM =================

const deleteProblem = async (req, res) => {

    const { id } = req.params;

    try {

        if (!id) {
            return res.status(400).json({
                message: "ID is Missing"
            });
        }


        const deletedProblem =
            await Problem.findByIdAndDelete(id);


        if (!deletedProblem) {
            return res.status(404).json({
                message: "Problem is Missing"
            });
        }


        return res.status(200).json({
            message: "Successfully Deleted"
        });

    }

    catch (err) {

        console.error("DELETE ERROR:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};



// ================= GET PROBLEM BY ID =================

const getProblemById = async (req, res) => {

    const { id } = req.params;

    try {

        if (!id) {
            return res.status(400).json({
                message: "ID is Missing"
            });
        }


        const getProblem = await Problem
            .findById(id)
            .select(
                "_id title description difficulty tags visibleTestCases startCode referenceSolution"
            );


        if (!getProblem) {
            return res.status(404).json({
                message: "Problem is Missing"
            });
        }


        return res.status(200).json(getProblem);

    }

    catch (err) {

        console.error("GET PROBLEM ERROR:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};



// ================= GET ALL PROBLEMS =================

const getAllProblem = async (req, res) => {

    try {

        const getProblem = await Problem
            .find({})
            .select("_id title difficulty tags");


        if (getProblem.length === 0) {
            return res.status(404).json({
                message: "Problem is Missing"
            });
        }


        return res.status(200).json(getProblem);

    }

    catch (err) {

        console.error("GET ALL PROBLEM ERROR:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};



// ================= SOLVED PROBLEMS =================

const solvedAllProblembyUser = async (req, res) => {

    try {

        const userId = req.result._id;


        const user = await User
            .findById(userId)
            .populate({
                path: "problemSolved",
                select: "_id title difficulty tags"
            });


        return res.status(200).json(user.problemSolved);

    }

    catch (err) {

        console.error("SOLVED PROBLEM ERROR:", err);

        return res.status(500).json({
            message: "Server Error"
        });
    }
};



// ================= SUBMITTED PROBLEMS =================

const submittedProblem = async (req, res) => {

    try {

        const userId = req.result._id;
        const problemId = req.params.pid;


        const ans = await Submission.find({
            userId,
            problemId
        });


        if (ans.length === 0) {
            return res.status(200).json({
                message: "No Submission is present",
                submissions: []
            });
        }


        return res.status(200).json(ans);

    }

    catch (err) {

        console.error("SUBMISSION ERROR:", err);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};



module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    solvedAllProblembyUser,
    submittedProblem
};