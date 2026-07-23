import { config } from "dotenv";
config({ path: ".env.local" });

type ClassDraft = {
  id: string;
  name: string;
  order: number;
  hasGroups: boolean;
};

const classes: ClassDraft[] = [
  {
    id: "class6",
    name: "Class 6",
    order: 6,
    hasGroups: false,
  },
  {
    id: "class7",
    name: "Class 7",
    order: 7,
    hasGroups: false,
  },
  {
    id: "class8",
    name: "Class 8",
    order: 8,
    hasGroups: false,
  },
  {
    id: "class9_10",
    name: "Class 9-10 (SSC)",
    order: 9,
    hasGroups: true,
  },
  {
    id: "class11_12",
    name: "Class 11-12 (HSC)",
    order: 11,
    hasGroups: true,
  },
];

async function seedClasses() {
  const { adminDb } = await import("../lib/firebase-admin");

  console.log("🚀 Seeding Classes...\n");

  const batch = adminDb.batch();

  for (const cls of classes) {
    const ref = adminDb.collection("classes").doc(cls.id);

    batch.set(ref, cls, { merge: true });

    console.log(`✅ ${cls.name}`);
  }

  await batch.commit();

  console.log("\n🎉 Classes Seed Completed Successfully.");
  process.exit(0);
}

seedClasses().catch((error) => {
  console.error("❌ Seed Failed\n");
  console.error(error);
  process.exit(1);
});