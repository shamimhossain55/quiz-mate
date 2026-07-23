import { QuizSession } from "@/types/quiz";

export function startQuiz(
  chapterId: string,
  questionCount: number,
  timeLimit: number,
  negativeMarking: boolean
): QuizSession {
  return {
    quizId: `${chapterId}_quiz`,
    chapterId,
    questionCount,
    timeLimit,
    negativeMarking,
    startedAt: Date.now(),
  };
}