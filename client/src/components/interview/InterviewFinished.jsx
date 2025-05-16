import { useEffect } from "react";
import { parseFeedback } from "../../utils/formatFeedback";

const InterviewFinished = ({
  sessionQuestions,
  onRestart,
  onSave,
  showUserDialog,
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  onSaveSession,
  onCancelSave,
  saveSuccess,
}) => {
  // Auto-save for logged-in users
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      onSaveSession && onSaveSession();
    }
    // eslint-disable-next-line
  }, []);

  const isLoggedIn = !!localStorage.getItem("user");

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-white mb-6">
          Interview Finished!
        </h2>
        <div className="space-y-8">
          {sessionQuestions.map((q, index) => {
            const feedbackSections = parseFeedback(q.feedback);
            return (
              <div key={index} className="bg-white/10 rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-blue-300 mb-2">
                  Question {index + 1}
                </h3>
                <p className="text-lg text-white/90 mb-4 font-semibold whitespace-pre-line">
                  {q.question}
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-2">
                      <span className="font-bold text-white">Your Answer:</span>
                      <pre className="bg-black/30 p-3 rounded-lg text-white/90 overflow-x-auto text-base mt-2 whitespace-pre-line">
                        {q.codeAnswer || q.textAnswer}
                      </pre>
                    </div>
                    <div className="mb-2">
                      <span className="font-bold text-white">Score:</span>
                      <span className="text-xl font-bold text-green-400 ml-2">
                        {q.score}/10
                      </span>
                    </div>
                  </div>
                  <div>
                    {feedbackSections.evaluation && (
                      <div className="mb-2">
                        <span className="font-bold text-white">
                          Evaluation:
                        </span>
                        <p className="text-white/90 mt-1 whitespace-pre-line">
                          {feedbackSections.evaluation}
                        </p>
                      </div>
                    )}
                    {feedbackSections.explanation && (
                      <div className="mb-2">
                        <span className="font-bold text-white">
                          Explanation:
                        </span>
                        <p className="text-white/90 mt-1 whitespace-pre-line">
                          {feedbackSections.explanation}
                        </p>
                      </div>
                    )}
                    {feedbackSections.code && (
                      <div className="mb-2">
                        <span className="font-bold text-white">
                          Code Example:
                        </span>
                        <pre className="bg-black/40 p-3 rounded-lg text-white/90 overflow-x-auto text-base mt-2 whitespace-pre-line">
                          {feedbackSections.code}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex gap-4">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-all"
          >
            Start New Interview
          </button>
          {!isLoggedIn && (
            <button
              onClick={onSave}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-all"
            >
              Save to History
            </button>
          )}
        </div>
      </div>

      {showUserDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">
              Save Interview Session
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/90 mb-2">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-white/90 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button
                onClick={onCancelSave}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onSaveSession}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          Interview session saved successfully!
        </div>
      )}
    </div>
  );
};

export default InterviewFinished;
