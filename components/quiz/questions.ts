// Temporary static question data used by the review page.
// TODO: Replace with dynamic data fetched from Firestore/QuizSession.

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index into options[]
}

export const questions: Question[] = [
  {
    id: "q1",
    question: "What is the capital of Bangladesh?",
    options: ["Chittagong", "Dhaka", "Sylhet", "Rajshahi"],
    correctAnswer: 1,
  },
  {
    id: "q2",
    question: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correctAnswer: 2,
  },
  {
    id: "q3",
    question: "What is 7 × 8?",
    options: ["54", "56", "62", "48"],
    correctAnswer: 1,
  },
];
