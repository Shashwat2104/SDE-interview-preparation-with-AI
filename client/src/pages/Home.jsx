import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-gray-900 flex flex-col items-center justify-center">
      <div className="bg-white/5 rounded-2xl shadow-lg p-10 flex flex-col items-center max-w-xl w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-center">
          AI SDE Interview Bot
        </h1>
        <p className="text-lg text-white/80 mb-10 text-center">
          Practice high-value, real SDE-1/SDE-2 interview questions for
          JavaScript, Node.js, and React. Powered by Gemini AI.
        </p>
        <button
          onClick={() => navigate("/interview")}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow transition-all"
        >
          Start Interview
        </button>
      </div>
    </div>
  );
};

export default Home;
