import { parseFeedback } from "../../utils/formatFeedback";

const FeedbackDisplay = ({ feedback, score, runOutput, onRunCode }) => {
  if (!feedback) return null;
  const {
    score: parsedScore,
    evaluation,
    explanation,
    code,
  } = parseFeedback(feedback);

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h2 className="text-3xl font-extrabold text-white mb-8">Feedback</h2>
      <div className="space-y-8">
        {parsedScore && (
          <div className="text-2xl font-bold text-white">
            Score: {parsedScore}
          </div>
        )}
        {evaluation && (
          <div>
            <h3 className="font-bold text-2xl text-white/90 mb-2">
              Evaluation:
            </h3>
            <p className="text-xl text-white/90">{evaluation}</p>
          </div>
        )}
        {explanation && (
          <div>
            <h3 className="font-bold text-2xl text-white/90 mb-2">
              Explanation:
            </h3>
            <p className="text-xl text-white/90">{explanation}</p>
          </div>
        )}
        {code && (
          <div>
            <h3 className="font-bold text-2xl text-white/90 mb-2">
              Code Example:
            </h3>
            <pre className="bg-black/30 p-4 rounded-lg text-white/90 overflow-x-auto text-lg">
              {code}
            </pre>
          </div>
        )}
        {runOutput && (
          <div className="mt-4">
            <h3 className="text-2xl font-semibold text-white mb-2">Output:</h3>
            <pre className="bg-black/30 p-4 rounded-lg text-white/90 overflow-x-auto text-lg">
              {runOutput}
            </pre>
            <button
              onClick={onRunCode}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-all"
            >
              Run Code Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackDisplay;
