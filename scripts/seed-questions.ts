import { config } from "dotenv";
config({ path: ".env.local" });

import { FieldValue } from "firebase-admin/firestore";

import { banglaChapter1Questions } from "../seed-data/class6/bangla/questions/ch1";

type QuestionSeeder = {
  chapterId: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    order: number;
  }[];
};

const questionData: QuestionSeeder[] = [
  {
    chapterId: "class6_bangla_ch1",
    questions: banglaChapter1Questions,
  },
];

async function seedQuestions() {
  const { adminDb } = await import("../lib/firebase-admin");

  console.log("🚀 Seeding Questions...\n");

  const batch = adminDb.batch();

  let total = 0;

  for (const chapter of questionData) {
    for (const question of chapter.questions) {
      const id = `${chapter.chapterId}_q${question.order}`;

      const ref = adminDb.collection("questions").doc(id);

      batch.set(
        ref,
        {
          id,
          
          chapterId: chapter.chapterId,
          
           quizId: `${chapter.chapterId}_quiz`,

          question: question.question,

          options: question.options,

          correctAnswer: question.correctAnswer,

          explanation: question.explanation,

          order: question.order,

          createdAt: FieldValue.serverTimestamp(),

          updatedAt: FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      total++;

      console.log(`✅ ${id}`);
    }
  }

  await batch.commit();

  console.log("\n=================================");
  console.log(`🎉 ${total} Questions Seeded`);
  console.log("=================================");

  process.exit(0);
}

seedQuestions().catch((error) => {
  console.error(error);
  process.exit(1);
});