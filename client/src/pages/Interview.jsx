import { useState, useEffect, useRef } from "react";
import { useSpeechRecognition } from "react-speech-recognition";
import SpeechRecognition from "react-speech-recognition";
import axios from "axios";
import TechStackSelector from "../components/interview/TechStackSelector";
import QuestionDisplay from "../components/interview/QuestionDisplay";
import AnswerInput from "../components/interview/AnswerInput";
import FeedbackDisplay from "../components/interview/FeedbackDisplay";
import InterviewFinished from "../components/interview/InterviewFinished";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MAX_QUESTIONS = 2;

const Interview = () => {
  const [step, setStep] = useState("setup"); // 'setup' | 'countdown' | 'interview'
  const [countdown, setCountdown] = useState(3);
  const [techStack, setTechStack] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [question, setQuestion] = useState("");
  const [codeAnswer, setCodeAnswer] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editorTheme] = useState("monokai");
  const [runOutput, setRunOutput] = useState("");
  const [allUserQuestions, setAllUserQuestions] = useState([]);
  const [userToken, setUserToken] = useState(0);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const iframeRef = useRef(null);

  // Countdown effect
  useEffect(() => {
    if (step === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === "countdown" && countdown === 0) {
      setTimeout(() => {
        setStep("interview");
        generateQuestion();
      }, 500); // short pause after 0
    }
  }, [step, countdown]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  useEffect(() => {
    // When listening, update textAnswer with transcript in real time
    if (listening) {
      setTextAnswer(transcript);
    }
    // Do not overwrite textAnswer when not listening
    // eslint-disable-next-line
  }, [transcript, listening]);

  const runCode = () => {
    if (!iframeRef.current) return;
    const code = codeAnswer;
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 20px; background: #1a1a1a; color: #fff; }
          </style>
        </head>
        <body>
          <script>
            try {
              ${code}
            } catch (error) {
              console.error(error);
            }
          </script>
        </body>
      </html>
    `);
    iframeDoc.close();
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "log") {
        setRunOutput((prev) => prev + event.data.message + "\n");
      } else if (event.data.type === "error") {
        setRunOutput((prev) => prev + "Error: " + event.data.message + "\n");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSubmit = async () => {
    // Require at least one answer (code or text)
    if (!codeAnswer.trim() && !textAnswer.trim()) {
      return;
    }
    setIsLoading(true);
    setShowFeedback(false);
    setRunOutput("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/interview/evaluate-answer",
        {
          question,
          codeAnswer,
          textAnswer,
          answerType: "both", // always send both
          techStack,
          difficulty,
        }
      );
      setFeedback(response.data.feedback);
      setScore(response.data.score);
      setShowFeedback(true);
      setIsTimerRunning(false);
      setSessionQuestions((prev) => [
        ...prev,
        {
          question,
          codeAnswer,
          textAnswer,
          feedback: response.data.feedback,
          score: response.data.score,
          isCoding: true,
        },
      ]);
      // Do NOT generate next question here
      if (questionNumber >= MAX_QUESTIONS) {
        setInterviewFinished(true);
      }
    } catch (error) {
      console.error("Error getting feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUserQuestions = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return [];
      const user = JSON.parse(userStr);
      const token = user.token;
      const res = await axios.get("http://localhost:5000/api/user/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Flatten all questions from all interview sessions
      const allQuestions = [];
      if (res.data && res.data.recentInterviews) {
        (res.data.recentInterviews || []).forEach((session) => {
          if (session.questions) {
            session.questions.forEach((q) => allQuestions.push(q.question));
          }
        });
      }
      if (res.data && res.data.interviewHistory) {
        (res.data.interviewHistory || []).forEach((session) => {
          (session.questions || []).forEach((q) =>
            allQuestions.push(q.question)
          );
        });
      }
      setAllUserQuestions(allQuestions);
      return allQuestions;
    } catch {
      setAllUserQuestions([]);
      return [];
    }
  };

  const generateQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/interview/generate-question",
        {
          techStack,
          difficulty,
          previousQuestions: allUserQuestions.concat(previousQuestions),
        }
      );
      setQuestion(response.data.question);
      setCodeAnswer("");
      setTextAnswer("");
      setPreviousQuestions((prev) => [...prev, response.data.question]);
      setIsTimerRunning(true);
      setTimer(300);
    } catch (error) {
      console.error("Error generating question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Modified handleStart to check token count
  const handleStart = async () => {
    // Check for user login
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("You must be logged in to start the interview.");
      return;
    }
    // Fetch all previous questions before starting
    await fetchAllUserQuestions();
    setStep("countdown");
    setCountdown(3);
  };

  const handleRestart = () => {
    setStep("setup");
    setTechStack("");
    setDifficulty("medium");
    setQuestion("");
    setCodeAnswer("");
    setTextAnswer("");
    setFeedback("");
    setScore(0);
    setShowFeedback(false);
    setPreviousQuestions([]);
    setQuestionNumber(1);
    setSessionQuestions([]);
    setInterviewFinished(false);
    setShowUserDialog(false);
    setUserName("");
    setUserEmail("");
    setSaveSuccess(false);
    setRunOutput("");
    resetTranscript();
  };

  const handleSave = () => {
    setShowUserDialog(true);
  };

  const handleSaveSession = async () => {
    // Use user info from localStorage if available
    let userObj = null;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) userObj = JSON.parse(userStr);
    } catch {
      /* ignore JSON parse error */
    }
    const nameToSave = userObj?.name || userName;
    const emailToSave = userObj?.email || userEmail;
    // Prepare answers, feedback, scores arrays
    const questionsArr = sessionQuestions.map((q) => q.question);
    const codeAnswersArr = sessionQuestions.map((q) => q.codeAnswer || "");
    const textAnswersArr = sessionQuestions.map((q) => q.textAnswer || "");
    const feedbackArr = sessionQuestions.map((q) => q.feedback || "");
    const scoresArr = sessionQuestions.map((q) => q.score || 0);
    const totalScore = scoresArr.length
      ? scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length
      : 0;
    try {
      await axios.post("http://localhost:5000/api/interview/save-interview", {
        name: nameToSave,
        email: emailToSave,
        techStack,
        questions: questionsArr,
        codeAnswers: codeAnswersArr,
        textAnswers: textAnswersArr,
        feedback: feedbackArr,
        scores: scoresArr,
        totalScore,
      });
      setShowUserDialog(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // No need to update token in localStorage here
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const handleCancelSave = () => {
    setShowUserDialog(false);
    setUserName("");
    setUserEmail("");
  };

  // Fetch user profile to get token count
  const fetchUserToken = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return 0;
      const user = JSON.parse(userStr);
      const token = user.token;
      // Try to get latest from backend
      const res = await axios.patch(
        "http://localhost:5000/api/user/profile",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && typeof res.data.token === "number") {
        setUserToken(res.data.token);
        // Update localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, token: res.data.token })
        );
        return res.data.token;
      }
      setUserToken(user.token || 0);
      return user.token || 0;
    } catch {
      setUserToken(0);
      return 0;
    }
  };

  // Buy More Tokens handler
  const handleBuyTokens = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const token = user.token;
      const res = await axios.patch(
        "http://localhost:5000/api/user/token",
        { token: 5 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && typeof res.data.token === "number") {
        setUserToken(res.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, token: res.data.token })
        );
        toast.success(
          "You have purchased more tokens! You can now take more interviews."
        );
      }
    } catch {
      toast.error("Failed to buy more tokens. Please try again.");
    }
  };

  useEffect(() => {
    fetchUserToken();
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">
            Your browser doesn't support speech recognition.
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          AI Interview Session
        </h1>

        {/* Always split screen: left = question, right = answer/solution */}
        <div className="flex flex-col lg:flex-row gap-8 mt-8 min-h-[400px]">
          {/* Left: Question or instructions */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start">
            {step === "setup" && (
              <div className="h-full flex flex-col justify-center items-center">
                <div className="mb-8 w-full">
                  <TechStackSelector
                    techStack={techStack}
                    setTechStack={setTechStack}
                    difficulty={difficulty}
                    setDifficulty={setDifficulty}
                    selectorsDisabled={false}
                  />
                </div>
                <div className="text-white/80 text-lg text-center mb-4">
                  Select your tech stack and difficulty, then click Start to
                  begin your interview.
                </div>
                <div className="mb-4">
                  <span className="text-blue-400 font-bold text-xl">
                    Tokens: {userToken}
                  </span>
                </div>
                {userToken === 0 && (
                  <button
                    onClick={handleBuyTokens}
                    className="mb-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Buy More Tokens
                  </button>
                )}
              </div>
            )}
            {step === "countdown" && (
              <div className="h-full flex flex-col justify-center items-center">
                <div className="text-7xl font-extrabold text-blue-400 drop-shadow-lg">
                  {countdown > 0 ? countdown : "Go!"}
                </div>
                <div className="mt-6 text-white/80 text-lg text-center">
                  Get ready! Your interview will begin shortly.
                </div>
              </div>
            )}
            {step === "interview" && (
              <QuestionDisplay
                question={question}
                questionNumber={questionNumber}
              />
            )}
          </div>

          {/* Right: Answer/solution or setup/start button */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start">
            {step === "setup" && (
              <div className="h-full flex flex-col justify-center items-center">
                <button
                  onClick={handleStart}
                  disabled={!techStack}
                  className={`mt-8 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
                    !techStack
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Start
                </button>
              </div>
            )}
            {step === "countdown" && (
              <div className="h-full flex flex-col justify-center items-center">
                {/* Empty or could add a spinner/loader */}
              </div>
            )}
            {step === "interview" && (
              <>
                <AnswerInput
                  codeAnswer={codeAnswer}
                  setCodeAnswer={setCodeAnswer}
                  textAnswer={textAnswer}
                  setTextAnswer={setTextAnswer}
                  editorTheme={editorTheme}
                  isRecording={listening}
                  startRecording={() =>
                    SpeechRecognition.startListening({
                      continuous: true,
                      language: "en-IN",
                    })
                  }
                  stopRecording={SpeechRecognition.stopListening}
                  transcript={transcript}
                  isListening={listening}
                />
                {showFeedback && (
                  <div className="mt-8">
                    <FeedbackDisplay
                      feedback={feedback}
                      score={score}
                      runOutput={runOutput}
                      onRunCode={runCode}
                    />
                  </div>
                )}
                <div className="mt-8 flex justify-center gap-4">
                  {!showFeedback && !interviewFinished && (
                    <button
                      onClick={handleSubmit}
                      disabled={
                        isLoading || (!codeAnswer.trim() && !textAnswer.trim())
                      }
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        isLoading || (!codeAnswer.trim() && !textAnswer.trim())
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {isLoading ? "Submitting..." : "Submit Answer"}
                    </button>
                  )}
                  {showFeedback && questionNumber < MAX_QUESTIONS && (
                    <button
                      onClick={() => {
                        setShowFeedback(false);
                        setCodeAnswer("");
                        setTextAnswer("");
                        resetTranscript();
                        setQuestionNumber((prev) => prev + 1);
                        generateQuestion();
                      }}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-all"
                    >
                      Next Question
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {interviewFinished && (
          <InterviewFinished
            sessionQuestions={sessionQuestions.map((q) => ({
              ...q,
              answer: q.codeAnswer || q.textAnswer || "",
            }))}
            onRestart={handleRestart}
            onSave={handleSave}
            showUserDialog={showUserDialog}
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            onSaveSession={handleSaveSession}
            onCancelSave={handleCancelSave}
            saveSuccess={saveSuccess}
          />
        )}

        <iframe
          ref={iframeRef}
          title="code-output"
          className="hidden"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
};

export default Interview;
