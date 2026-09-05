import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from "../components/ChatAi";

const langMap = {
  cpp: "C++",
  java: "Java",
  javascript: "JavaScript",
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");

  const editorRef = useRef(null);

  const { problemId } = useParams();

  // =========================
  // FETCH PROBLEM
  // =========================

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get(
          `/problem/problemById/${problemId}`,
        );

        console.log("PROBLEM DATA:", response.data);
        console.log("START CODE:", response.data.startCode);

        setProblem(response.data);

        const foundCode = response.data.startCode?.find(
          (item) => item.language === langMap[selectedLanguage],
        );

        console.log("FOUND CODE:", foundCode);

        setCode(foundCode?.initialCode || "");
      } catch (error) {
        console.error("Error fetching problem:", error);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  // =========================
  // CHANGE LANGUAGE
  // =========================

  useEffect(() => {
    if (!problem) return;

    const foundCode = problem.startCode?.find(
      (item) => item.language === langMap[selectedLanguage],
    );

    console.log("LANGUAGE:", selectedLanguage);
    console.log("FOUND CODE:", foundCode);

    setCode(foundCode?.initialCode || "");
  }, [selectedLanguage, problem]);

  // =========================
  // EDITOR CHANGE
  // =========================

  const handleEditorChange = (value) => {
    setCode(value || "");
  };

  // =========================
  // EDITOR MOUNT
  // =========================

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // =========================
  // LANGUAGE CHANGE
  // =========================

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  // =========================
  // RUN CODE
  // =========================

  const handleRun = async () => {
    if (!code.trim()) {
      setRunResult({
        success: false,
        error: "Please write some code first.",
      });

      setActiveRightTab("testcase");
      return;
    }

    try {
      setLoading(true);
      setRunResult(null);

      console.log("RUN REQUEST:", {
        problemId,
        code,
        language: selectedLanguage,
      });

      const response = await axiosClient.post(`/submit/run/${problemId}`, {
        code,
        language: selectedLanguage,
      });

      console.log("RUN RESPONSE:", response.data);

      setRunResult(response.data);
      setActiveRightTab("testcase");
    } catch (error) {
      console.error("Error running code:", error);

      setRunResult({
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data ||
          "Internal server error",
      });

      setActiveRightTab("testcase");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SUBMIT CODE
  // =========================

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setSubmitResult({
        accepted: false,
        error: "Please write some code first.",
        passedTestCases: 0,
        totalTestCases: 0,
      });

      setActiveRightTab("result");
      return;
    }

    try {
      setLoading(true);
      setSubmitResult(null);

      console.log("SUBMIT REQUEST:", {
        problemId,
        code,
        language: selectedLanguage,
      });

      const response = await axiosClient.post(`/submit/submit/${problemId}`, {
        code,
        language: selectedLanguage,
      });

      console.log("SUBMIT RESPONSE:", response.data);

      setSubmitResult(response.data);
      setActiveRightTab("result");
    } catch (error) {
      console.error("Error submitting code:", error);

      setSubmitResult({
        accepted: false,
        error:
          error.response?.data?.message ||
          error.response?.data ||
          "Internal server error",
        passedTestCases: 0,
        totalTestCases: 0,
      });

      setActiveRightTab("result");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // MONACO LANGUAGE
  // =========================

  const getLanguageForMonaco = (lang) => {
    if (lang === "cpp") return "cpp";
    if (lang === "java") return "java";
    return "javascript";
  };

  // =========================
  // DIFFICULTY COLOR
  // =========================

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500";

      case "medium":
        return "text-yellow-500";

      case "hard":
        return "text-red-500";

      default:
        return "text-gray-500";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // =========================
  // NO PROBLEM
  // =========================

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Problem not found.</p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="h-screen flex bg-base-100">
      {/* ================= LEFT PANEL ================= */}

      <div className="w-1/2 flex flex-col border-r border-base-300">
        {/* LEFT TABS */}

        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button
            className={`tab ${
              activeLeftTab === "description" ? "tab-active" : ""
            }`}
            onClick={() => setActiveLeftTab("description")}
          >
            Description
          </button>

          <button
            className={`tab ${
              activeLeftTab === "editorial" ? "tab-active" : ""
            }`}
            onClick={() => setActiveLeftTab("editorial")}
          >
            Editorial
          </button>

          <button
            className={`tab ${
              activeLeftTab === "solutions" ? "tab-active" : ""
            }`}
            onClick={() => setActiveLeftTab("solutions")}
          >
            Solutions
          </button>

          <button
            className={`tab ${
              activeLeftTab === "submissions" ? "tab-active" : ""
            }`}
            onClick={() => setActiveLeftTab("submissions")}
          >
            Submissions
          </button>

          <button
            className={`tab ${activeLeftTab === "chatAI" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("chatAI")}
          >
            ChatAI
          </button>
        </div>

        {/* LEFT CONTENT */}

        <div className="flex-1 overflow-y-auto p-6">
          {/* DESCRIPTION */}

          {activeLeftTab === "description" && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">{problem.title}</h1>

                <div
                  className={`badge badge-outline ${getDifficultyColor(
                    problem.difficulty,
                  )}`}
                >
                  {problem.difficulty
                    ? problem.difficulty.charAt(0).toUpperCase() +
                      problem.difficulty.slice(1)
                    : ""}
                </div>

                <div className="badge badge-primary">{problem.tags}</div>
              </div>

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {problem.description}
                </div>
              </div>

              {/* EXAMPLES */}

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Examples:</h3>

                <div className="space-y-4">
                  {problem.visibleTestCases?.map((example, index) => (
                    <div key={index} className="bg-base-200 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Example {index + 1}:
                      </h4>

                      <div className="space-y-2 text-sm font-mono">
                        <div>
                          <strong>Input:</strong> {example.input}
                        </div>

                        <div>
                          <strong>Output:</strong> {example.output}
                        </div>

                        <div>
                          <strong>Explanation:</strong> {example.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EDITORIAL */}

          {activeLeftTab === "editorial" && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-bold mb-4">Editorial</h2>

              <div className="whitespace-pre-wrap text-sm">
                Editorial is here for the problem.
              </div>
            </div>
          )}

          {/* SOLUTIONS */}

          {activeLeftTab === "solutions" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Solutions</h2>

              <div className="space-y-6">
                {problem.referenceSolution?.map((solution, index) => (
                  <div
                    key={index}
                    className="border border-base-300 rounded-lg"
                  >
                    <div className="bg-base-200 px-4 py-2 rounded-t-lg">
                      <h3 className="font-semibold">
                        {problem.title} - {solution.language}
                      </h3>
                    </div>

                    <div className="p-4">
                      <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
                        <code>{solution.completeCode}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBMISSIONS */}

          {activeLeftTab === "submissions" && (
            <div>
              <h2 className="text-xl font-bold mb-4">My Submissions</h2>

              <SubmissionHistory problemId={problemId} />
            </div>
          )}

          {/* CHAT AI */}

          {activeLeftTab === "chatAI" && (
            <div>
              <h2 className="text-xl font-bold mb-4">CHAT with AI</h2>

              <ChatAi problem={problem} />
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}

      <div className="w-1/2 flex flex-col">
        {/* RIGHT TABS */}

        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button
            className={`tab ${activeRightTab === "code" ? "tab-active" : ""}`}
            onClick={() => setActiveRightTab("code")}
          >
            Code
          </button>

          <button
            className={`tab ${
              activeRightTab === "testcase" ? "tab-active" : ""
            }`}
            onClick={() => setActiveRightTab("testcase")}
          >
            Testcase
          </button>

          <button
            className={`tab ${activeRightTab === "result" ? "tab-active" : ""}`}
            onClick={() => setActiveRightTab("result")}
          >
            Result
          </button>
        </div>

        {/* RIGHT CONTENT */}

        <div className="flex-1 flex flex-col">
          {/* ================= CODE ================= */}

          {activeRightTab === "code" && (
            <div className="flex-1 flex flex-col">
              {/* LANGUAGE */}

              <div className="flex justify-between items-center p-4 border-b border-base-300">
                <div className="flex gap-2">
                  {["javascript", "java", "cpp"].map((lang) => (
                    <button
                      key={lang}
                      className={`btn btn-sm ${
                        selectedLanguage === lang ? "btn-primary" : "btn-ghost"
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === "cpp"
                        ? "C++"
                        : lang === "javascript"
                          ? "JavaScript"
                          : "Java"}
                    </button>
                  ))}
                </div>
              </div>

              {/* MONACO */}

              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: {
                      enabled: false,
                    },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: "on",
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: "line",
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: "line",
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* BUTTONS */}

              <div className="p-4 border-t border-base-300 flex justify-between">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveRightTab("testcase")}
                >
                  Console
                </button>

                <div className="flex gap-2">
                  <button
                    className={`btn btn-outline btn-sm ${
                      loading ? "loading" : ""
                    }`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    Run
                  </button>

                  <button
                    className={`btn btn-primary btn-sm ${
                      loading ? "loading" : ""
                    }`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TESTCASE ================= */}

          {activeRightTab === "testcase" && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>

              {!runResult && (
                <div className="text-gray-500">
                  Click "Run" to test your code.
                </div>
              )}

              {runResult && (
                <div
                  className={`alert ${
                    runResult.success ? "alert-success" : "alert-error"
                  }`}
                >
                  <div className="w-full">
                    {runResult.success ? (
                      <>
                        <h4 className="font-bold">✅ All test cases passed!</h4>

                        {runResult.runtime && (
                          <p className="text-sm mt-2">
                            Runtime: {runResult.runtime} sec
                          </p>
                        )}

                        {runResult.memory && (
                          <p className="text-sm">
                            Memory: {runResult.memory} KB
                          </p>
                        )}

                        {runResult.testCases?.map((tc, index) => (
                          <div
                            key={index}
                            className="bg-base-100 p-3 rounded mt-3 text-xs"
                          >
                            <div>
                              <strong>Input:</strong> {tc.stdin}
                            </div>

                            <div>
                              <strong>Expected:</strong> {tc.expected_output}
                            </div>

                            <div>
                              <strong>Output:</strong> {tc.stdout}
                            </div>

                            <div className="text-green-600">✓ Passed</div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <h4 className="font-bold">❌ Error</h4>

                        <p className="mt-2">{runResult.error}</p>

                        {runResult.testCases?.map((tc, index) => (
                          <div
                            key={index}
                            className="bg-base-100 p-3 rounded mt-3 text-xs"
                          >
                            <div>
                              <strong>Input:</strong> {tc.stdin}
                            </div>

                            <div>
                              <strong>Expected:</strong> {tc.expected_output}
                            </div>

                            <div>
                              <strong>Output:</strong> {tc.stdout}
                            </div>

                            <div
                              className={
                                tc.status_id === 3
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {tc.status_id === 3 ? "✓ Passed" : "✗ Failed"}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= RESULT ================= */}

          {activeRightTab === "result" && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>

              {!submitResult && (
                <div className="text-gray-500">
                  Click "Submit" to submit your solution.
                </div>
              )}

              {submitResult && (
                <div
                  className={`alert ${
                    submitResult.accepted ? "alert-success" : "alert-error"
                  }`}
                >
                  <div>
                    {submitResult.accepted ? (
                      <>
                        <h4 className="font-bold text-lg">🎉 Accepted</h4>

                        <p className="mt-2">
                          Test Cases Passed: {submitResult.passedTestCases}/
                          {submitResult.totalTestCases}
                        </p>

                        {submitResult.runtime && (
                          <p>Runtime: {submitResult.runtime} sec</p>
                        )}

                        {submitResult.memory && (
                          <p>Memory: {submitResult.memory} KB</p>
                        )}
                      </>
                    ) : (
                      <>
                        <h4 className="font-bold text-lg">
                          ❌ {submitResult.error}
                        </h4>

                        <p className="mt-2">
                          Test Cases Passed: {submitResult.passedTestCases}/
                          {submitResult.totalTestCases}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
