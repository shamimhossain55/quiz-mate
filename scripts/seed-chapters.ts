import { config } from "dotenv";
config({ path: ".env.local" });

import { FieldValue } from "firebase-admin/firestore";

import { banglaChapters } from "../seed-data/class6/bangla";
// পরে এগুলো add হবে
// import { englishChapters } from "../seed-data/class6/english";
import { scienceChapters } from "../seed-data/class6/science";
import { mathChapters } from "@/seed-data/class6/math";
// import { bgsChapters } from "../seed-data/class6/bgs";
// import { ictChapters } from "../seed-data/class6/ict";
// import { religionChapters } from "../seed-data/class6/religion";

type ChapterSeeder = {
  subjectId: string;
  chapters: {
    title: string;
    author?: string;
    order: number;
  }[];
};

const chapterData: ChapterSeeder[] = [
  {
    subjectId: "class6_bangla",
    chapters: banglaChapters,
  },

  // পরে শুধু এগুলো Uncomment করলেই হবে

  // {
  //   subjectId: "class6_english",
  //   chapters: englishChapters,
  // },

    {
     subjectId: "class6_math",
     chapters:mathChapters,
    },

     {
       subjectId: "class6_science",
       chapters: scienceChapters,
     },
];

async function seedChapters() {
  const { adminDb } = await import("../lib/firebase-admin");

  console.log("🚀 Seeding Chapters...\n");

  const batch = adminDb.batch();

  let total = 0;

  for (const subject of chapterData) {
    for (const chapter of subject.chapters) {
      const id = `${subject.subjectId}_ch${chapter.order}`;

      const ref = adminDb.collection("chapters").doc(id);

    batch.set(
      ref,
    {
      id,

    subjectId: subject.subjectId,

    name: chapter.title,

    author: chapter.author ?? null,

    order: chapter.order,

    createdAt: FieldValue.serverTimestamp(),

    updatedAt: FieldValue.serverTimestamp(),
  },
  {
    merge: true,
  }
);

      total++;

      console.log(
        `✅ ${subject.subjectId} → Chapter ${chapter.order}`
      );
    }
  }

  await batch.commit();

  console.log("\n====================================");
  console.log(`🎉 ${total} Chapters Seed Completed`);
  console.log("====================================");

  process.exit(0);
}

seedChapters().catch((error) => {
  console.error(error);
  process.exit(1);
});