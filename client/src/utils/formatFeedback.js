export function parseFeedback(feedback) {
  // Remove markdown bold/italic, headings, backticks, etc.
  const strip = (str) =>
    (str || "")
      .replace(/[*_`#]/g, "")
      .replace(/\.{2,}/g, ".")
      .replace(/\*\*/g, "")
      .trim();

  let clean = strip(feedback);

  // Extract code block (if any)
  let code = "";
  // Extract from 'Correct Answer:' or 'Code Example:'
  const correctAnswerMatch = clean.match(
    /Correct Answer[:：]?([\s\S]*?)(Explanation|Practical Example|$)/i
  );
  let correctAnswer = "";
  if (correctAnswerMatch) {
    correctAnswer = strip(correctAnswerMatch[1]);
    clean = clean
      .replace(
        /Correct Answer[:：]?[\s\S]*?(Explanation|Practical Example|$)/i,
        ""
      )
      .trim();
  }
  const codeExampleMatch = clean.match(
    /Code Example[:：]?([\s\S]*?)(Explanation|Why Useful|Maintaining State|Event Handling|Curry|$)/i
  );
  if (codeExampleMatch) {
    code = strip(codeExampleMatch[1]);
    clean = clean
      .replace(
        /Code Example[:：]?[\s\S]*?(Explanation|Why Useful|Maintaining State|Event Handling|Curry|$)/i,
        ""
      )
      .trim();
  }

  // Extract score
  const scoreMatch = feedback.match(/Score[:：]?\s*([0-9]{1,2})/i);
  const score = scoreMatch ? strip(scoreMatch[1]) : "";

  // Extract evaluation
  const evaluationMatch = feedback.match(
    /Evaluation[:：]?([\s\S]*?)(Explanation|Correct Answer|Practical Example|$)/i
  );
  const evaluation = evaluationMatch ? strip(evaluationMatch[1]) : "";

  // Extract explanation
  const explanationMatch = feedback.match(
    /Explanation[:：]?([\s\S]*?)(Correct Answer|Practical Example|Code Example|Why Useful|Maintaining State|Event Handling|Curry|$)/i
  );
  const explanation = explanationMatch ? strip(explanationMatch[1]) : "";

  // Extract bullet sections (Why Useful, Maintaining State, etc.)
  const bulletSections = {};
  const bulletTitles = [
    "Why Useful",
    "Maintaining State",
    "Event Handling",
    "Currying and Partial Application",
    "Curry",
  ];
  bulletTitles.forEach((title) => {
    const match = feedback.match(
      new RegExp(`${title}[:：]?([\s\S]*?)(\n\n|$)`, "i")
    );
    if (match) {
      bulletSections[title] = strip(match[1]);
    }
  });

  return {
    score,
    evaluation,
    explanation,
    correctAnswer,
    code,
    ...bulletSections,
  };
}
