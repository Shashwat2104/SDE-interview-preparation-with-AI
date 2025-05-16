const QuestionDisplay = ({ question, questionNumber }) => {
  if (!question) return null;

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8">
        Question {questionNumber}:
      </h2>
      <p className="text-xl md:text-2xl text-white/90 whitespace-pre-line font-medium">
        {question}
      </p>
    </div>
  );
};

export default QuestionDisplay;
