import { config } from "dotenv";
config({ path: ".env.local" });

import { FieldValue } from "firebase-admin/firestore";

type QuizSeeder = {
  chapterId: string;
  title: string;
  duration: number;
  totalQuestions: number;
};

const quizzes: QuizSeeder[] = [
  {
    chapterId: "class6_bangla_ch1",
    title: "Practice Quiz",
    duration: 20,
    totalQuestions: 20,
  },
];

async function seedQuizzes() {
  const { adminDb } = await import("../lib/firebase-admin");

  console.log("🚀 Seeding Quizzes...\n");

  const batch = adminDb.batch();

  let total = 0;

  for (const quiz of quizzes) {
    const id = `${quiz.chapterId}_quiz`;

    const ref = adminDb.collection("quizzes").doc(id);

    batch.set(
      ref,
      {
        id,

        chapterId: quiz.chapterId,

        title: quiz.title,

        duration: quiz.duration,

        totalQuestions: quiz.totalQuestions,

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

  await batch.commit();

  console.log("\n===============================");
  console.log(`🎉 ${total} Quiz Seeded`);
  console.log("===============================");

  process.exit(0);
}

seedQuizzes().catch((error) => {
  console.error(error);
  process.exit(1);
});