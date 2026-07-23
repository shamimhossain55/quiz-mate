export interface QuizSession {
  quizId: string;

  chapterId: string;

  questionCount: number;

  timeLimit: number;

  negativeMarking: boolean;

  startedAt: number;
}

export interface QuizAnswer {
  questionId: string;

  selectedAnswer: number | null;

  isMarked: boolean;
}

export interface QuizResult {
  score: number;

  correct: number;

  wrong: number;

  skipped: number;

  percentage: number;

  timeTaken: number;
}