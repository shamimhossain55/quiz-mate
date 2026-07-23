import { config } from "dotenv";
config({ path: ".env.local" });

import { FieldValue } from "firebase-admin/firestore";

type Group = "all" | "science" | "commerce" | "arts";

type SubjectDraft = {
  classId: string;
  name: string;
  slug: string;
  group: Group;
  order: number;
  icon: string;
  color: string;
  description: string;
};

const subjects: SubjectDraft[] = [
  // ==========================
  // Class 6
  // ==========================

  {
    classId: "class6",
    name: "বাংলা",
    slug: "bangla",
    group: "all",
    order: 1,
    icon: "languages",
    color: "text-rose-500",
    description: "Grammar, Literature & Writing",
  },

  {
    classId: "class6",
    name: "ইংরেজি",
    slug: "english",
    group: "all",
    order: 2,
    icon: "book",
    color: "text-blue-500",
    description: "Grammar, Reading & Vocabulary",
  },

  {
    classId: "class6",
    name: "গণিত",
    slug: "math",
    group: "all",
    order: 3,
    icon: "calculator",
    color: "text-emerald-500",
    description: "Practice with problem solving",
  },

  {
    classId: "class6",
    name: "বিজ্ঞান",
    slug: "science",
    group: "all",
    order: 4,
    icon: "atom",
    color: "text-violet-500",
    description: "Physics, Chemistry & Biology",
  },

  {
    classId: "class6",
    name: "বাংলাদেশ ও বিশ্বপরিচয়",
    slug: "bgs",
    group: "all",
    order: 5,
    icon: "globe",
    color: "text-orange-500",
    description: "Bangladesh & Global Studies",
  },

  {
    classId: "class6",
    name: "তথ্য ও যোগাযোগ প্রযুক্তি",
    slug: "ict",
    group: "all",
    order: 6,
    icon: "monitor",
    color: "text-cyan-500",
    description: "Information & Communication Technology",
  },

  {
    classId: "class6",
    name: "ধর্ম শিক্ষা",
    slug: "religion",
    group: "all",
    order: 7,
    icon: "landmark",
    color: "text-amber-500",
    description: "Religious & Moral Education",
  },

  // পরে Class 7-12 এখানে Add হবে
];

async function seedSubjects() {
  const { adminDb } = await import("../lib/firebase-admin");

  console.log("🚀 Seeding Subjects...\n");

  const batch = adminDb.batch();

  for (const subject of subjects) {
    const id = `${subject.classId}_${subject.slug}`;

    const ref = adminDb.collection("subjects").doc(id);

    batch.set(
      ref,
      {
        id,
        classId: subject.classId,
        name: subject.name,
        slug: subject.slug,
        group: subject.group,
        order: subject.order,

        icon: subject.icon,
        color: subject.color,
        description: subject.description,

        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    console.log(`✅ ${subject.classId} → ${subject.name}`);
  }

  await batch.commit();

  console.log("\n==================================");
  console.log("🎉 Subjects Seed Completed");
  console.log("==================================");

  process.exit(0);
}

seedSubjects().catch((error) => {
  console.error(error);
  process.exit(1);
});