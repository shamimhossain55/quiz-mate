export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const questions: Question[] = [
  {
    id: "q1",
    question: "What is the value of 5 + 7 ?",
    options: [
      "10",
      "11",
      "12",
      "13",
    ],
    correctAnswer: 2,
  },
  {
    id: "q2",
    question: "Which one is a prime number?",
    options: [
      "9",
      "12",
      "17",
      "21",
    ],
    correctAnswer: 2,
  },
  {
    id: "q3",
    question: "2 × 8 = ?",
    options: [
      "14",
      "16",
      "18",
      "20",
    ],
    correctAnswer: 1,
  },
];