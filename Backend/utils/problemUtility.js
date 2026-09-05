const axios = require("axios");

const ONECOMPILER_URL = "https://api.onecompiler.com/v1/run";

const resultStore = new Map();


// ===============================
// Language Mapping
// ===============================

const getLanguageById = (lang) => {
    const language = {
        "cpp": "cpp",
        "c++": "cpp",
        "java": "java",
        "javascript": "javascript"
    };

    return language[lang.toLowerCase()];
};


// ===============================
// Execute Code
// ===============================

const submitBatch = async (submissions) => {
    try {

        if (!submissions || submissions.length === 0) {
            throw new Error("No submissions provided");
        }

        const sourceCode = submissions[0].source_code;
        const language = submissions[0].language_id;

        if (!language) {
            throw new Error("Invalid language");
        }

        const inputs = submissions.map(
            (submission) => submission.stdin
        );

        console.log("LANGUAGE:", language);
        console.log("INPUTS:", inputs);

        const response = await axios.post(
            ONECOMPILER_URL,
            {
                language: language,
                stdin: inputs,

                files: [
                    {
                        name: getFileName(language),
                        content: sourceCode
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": process.env.ONECOMPILER_API_KEY
                }
            }
        );

        console.log("OneCompiler Response:");
        console.log(response.data);


        // ===============================
        // Store Results
        // ===============================

        const results = response.data.map((result, index) => {

            const token = `${Date.now()}-${index}`;

            resultStore.set(token, result);

            return {
                token: token
            };
        });

        return results;

    } catch (error) {

        console.error(
            "OneCompiler Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ===============================
// Get Results
// ===============================

const submitToken = async (tokens) => {

    try {

        const results = [];

        for (const token of tokens) {

            const result = resultStore.get(token);

            if (!result) {

                results.push({
                    status_id: 4,
                    stdout: "",
                    stderr: "Result not found",
                    executionTime: 0,
                    memoryUsed: 0
                });

                continue;
            }


            // ===============================
            // Successful Execution
            // ===============================

            if (
                result.status === "success" &&
                !result.exception &&
                !result.stderr
            ) {

                results.push({

                    // Judge0-style Accepted
                    status_id: 3,

                    stdout: result.stdout || "",

                    stderr: null,

                    executionTime:
                        Number(result.executionTime) || 0,

                    memoryUsed:
                        Number(result.memoryUsed) || 0

                });

            }

            // ===============================
            // Execution / Compilation Error
            // ===============================

            else {

                results.push({

                    // Judge0-style Error
                    status_id: 4,

                    stdout: result.stdout || "",

                    stderr:
                        result.stderr ||
                        result.exception ||
                        "Execution failed",

                    executionTime:
                        Number(result.executionTime) || 0,

                    memoryUsed:
                        Number(result.memoryUsed) || 0

                });
            }
        }

        return results;

    } catch (error) {

        console.error(
            "Result Error:",
            error.message
        );

        throw error;
    }
};


// ===============================
// File Name
// ===============================

const getFileName = (language) => {

    if (language === "cpp") {
        return "main.cpp";
    }

    if (language === "java") {
        return "Main.java";
    }

    if (language === "javascript") {
        return "main.js";
    }

    return "main.txt";
};


// ===============================
// Export
// ===============================

module.exports = {
    getLanguageById,
    submitBatch,
    submitToken
};