
const { GoogleGenAI } = require("@google/genai");

const solveDoubt = async (req, res) => {
  try {
    const {
      messages,
      title,
      description,
      testCases,
      startCode,
    } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_KEY,
    });

    const formattedMessages = messages.map((msg) => ({
      role: msg.role === "model" ? "model" : "user",
      parts: [
        {
          text: msg.content,
        },
      ],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: formattedMessages,

      config: {
        systemInstruction: `
You are an expert Data Structures and Algorithms tutor.

Help the student understand the problem instead of directly giving the complete solution.

Problem Title:
${title}

Problem Description:
${description}

Test Cases:
${JSON.stringify(testCases)}

Starting Code:
${JSON.stringify(startCode)}

Rules:
1. Explain concepts in simple language.
2. Give hints when the student is stuck.
3. Explain the approach step by step.
4. Do not immediately give complete code unless the student asks.
5. Help debug the student's code.
6. Focus on DSA and interview preparation.
`,
      },
    });

    return res.status(200).json({
      message: response.text,
    });

  } catch (error) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      message: "AI error",
      error: error.message,
    });
  }
};

module.exports = solveDoubt;

