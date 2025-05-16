const TechStackSelector = ({
  techStack,
  setTechStack,
  difficulty,
  setDifficulty,
  selectorsDisabled,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <select
        disabled={selectorsDisabled}
        value={techStack}
        onChange={(e) => setTechStack(e.target.value)}
        className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <option value="">Select Tech Stack</option>
        <option value="JavaScript">JavaScript</option>
        <option value="Node.js">Node.js</option>
        <option value="React">React</option>
      </select>
      <div className="flex gap-2">
        {["easy", "medium", "difficult"].map((diff) => (
          <button
            key={diff}
            disabled={selectorsDisabled}
            onClick={() => !selectorsDisabled && setDifficulty(diff)}
            className={`px-4 py-2 rounded-lg transition-all ${
              difficulty === diff
                ? "bg-blue-500 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            } disabled:opacity-50`}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TechStackSelector;
