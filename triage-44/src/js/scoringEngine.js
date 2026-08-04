
const VALID_ANSWERS = ['malicious', 'benign', 'needs_investigation'];

export function submitAnswer(scenario, userAnswer) {
  if (!VALID_ANSWERS.includes(userAnswer)) {
    throw new Error('InvalidAnswerError: userAnswer must be malicious, benign, or needs_investigation');
  }
  const isCorrect = userAnswer === scenario.category;
  return {
    isCorrect,
    correctAnswer: scenario.category,
    explanation: scenario.explanation,
  };
}

export function calculateAccuracy(score, totalAnswered) {
  if (totalAnswered === 0) return 0;
  return Math.round((score / totalAnswered) * 100);
}
