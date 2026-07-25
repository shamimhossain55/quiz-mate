import { execSync } from "child_process";

console.log("==========================================");
console.log("🚀 Starting Full Firebase Database Seed...");
console.log("==========================================");

const commands = [
  { name: "Classes", cmd: "npx tsx scripts/seed-classes.ts" },
  { name: "Subjects", cmd: "npx tsx scripts/seed-subjects.ts" },
  { name: "Chapters", cmd: "npx tsx scripts/seed-chapters.ts" },
  { name: "Questions", cmd: "npx tsx scripts/seed-questions.ts" },
  { name: "Quizzes", cmd: "npx tsx scripts/seed-quizzes.ts" },
];

for (const item of commands) {
  console.log(`\n📌 Seeding ${item.name}...`);
  try {
    execSync(item.cmd, { stdio: "inherit" });
  } catch (err) {
    console.error(`❌ Failed to seed ${item.name}`);
    process.exit(1);
  }
}

console.log("\n==========================================");
console.log("🎉 ALL FIREBASE SEEDS COMPLETED SUCCESSFULLY!");
console.log("==========================================");
