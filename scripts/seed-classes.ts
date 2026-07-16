/**
 * classes আর classes/{classId}/subjects কালেকশন বসানোর script
 * ⚠️ এটা একটা খসড়া (NCTB-এর সাধারণ তালিকা ধরে বানানো) — নিজে একবার চেক করে নাও,
 *    বিশেষ করে ক্লাস ১১-১২ এর অংশ, কারণ প্রতিষ্ঠান/বোর্ড ভেদে সামান্য তারতম্য থাকতে পারে।
 *
 * চালানোর নিয়ম আগের seed-subjects.ts এর মতোই:
 *   npx tsx scripts/seed-classes.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
// ⚠️ adminDb কে dynamic import দিয়ে আনা হচ্ছে, যাতে dotenv এর config() লোড হওয়ার
//    আগেই firebase-admin.ts রান না হয়ে যায় (ES module import hoisting এর কারণে
//    static import উপরের config() এর আগেই চলে যেত — এটা seed-chapters-class6.ts এ যেভাবে ফিক্স করা হয়েছে সেভাবেই)

type SubjectDraft = {
  name: string;
  group: "all" | "science" | "commerce" | "arts";
  order: number;
};

type ClassDraft = {
  id: string; // "class6", "class9_10", "class11_12" ইত্যাদি
  name: string;
  hasGroups: boolean;
  subjects: SubjectDraft[];
};

// ---- ক্লাস ৬-৮ (কোনো গ্রুপ নেই, সব বিষয় বাধ্যতামূলক) ----
const juniorSubjects: SubjectDraft[] = [
  { name: "বাংলা", group: "all", order: 1 },
  { name: "ইংরেজি", group: "all", order: 2 },
  { name: "গণিত", group: "all", order: 3 },
  { name: "বিজ্ঞান", group: "all", order: 4 },
  { name: "বাংলাদেশ ও বিশ্বপরিচয়", group: "all", order: 5 },
  { name: "তথ্য ও যোগাযোগ প্রযুক্তি", group: "all", order: 6 },
  { name: "ধর্ম শিক্ষা", group: "all", order: 7 },
];

// ---- ক্লাস ৯-১০ (SSC) — কম্পালসরি + গ্রুপভিত্তিক ----
const ssc: SubjectDraft[] = [
  // কম্পালসরি (সব গ্রুপের জন্য)
  { name: "বাংলা", group: "all", order: 1 },
  { name: "ইংরেজি", group: "all", order: 2 },
  { name: "গণিত (সাধারণ)", group: "all", order: 3 },
  { name: "তথ্য ও যোগাযোগ প্রযুক্তি", group: "all", order: 4 },
  { name: "বাংলাদেশ ও বিশ্বপরিচয়", group: "all", order: 5 },
  { name: "ধর্ম শিক্ষা", group: "all", order: 6 },
  { name: "ক্যারিয়ার শিক্ষা", group: "all", order: 7 },
  // বিজ্ঞান গ্রুপ
  { name: "পদার্থবিজ্ঞান", group: "science", order: 10 },
  { name: "রসায়ন", group: "science", order: 11 },
  { name: "জীববিজ্ঞান", group: "science", order: 12 },
  { name: "উচ্চতর গণিত", group: "science", order: 13 },
  // ব্যবসায় শিক্ষা (Commerce) গ্রুপ
  { name: "হিসাববিজ্ঞান", group: "commerce", order: 20 },
  { name: "ফিন্যান্স ও ব্যাংকিং", group: "commerce", order: 21 },
  { name: "ব্যবসায় উদ্যোগ", group: "commerce", order: 22 },
  // মানবিক (Arts) গ্রুপ
  { name: "পৌরনীতি ও নাগরিকতা", group: "arts", order: 30 },
  { name: "অর্থনীতি", group: "arts", order: 31 },
  { name: "ভূগোল ও পরিবেশ", group: "arts", order: 32 },
  { name: "বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা", group: "arts", order: 33 },
];

// ---- ক্লাস ১১-১২ (HSC) — কম্পালসরি + গ্রুপভিত্তিক (⚠️ draft, ভালোভাবে চেক করে নাও) ----
const hsc: SubjectDraft[] = [
  // কম্পালসরি
  { name: "বাংলা", group: "all", order: 1 },
  { name: "English", group: "all", order: 2 },
  { name: "তথ্য ও যোগাযোগ প্রযুক্তি", group: "all", order: 3 },
  // বিজ্ঞান গ্রুপ
  { name: "পদার্থবিজ্ঞান", group: "science", order: 10 },
  { name: "রসায়ন", group: "science", order: 11 },
  { name: "জীববিজ্ঞান", group: "science", order: 12 },
  { name: "উচ্চতর গণিত", group: "science", order: 13 },
  // ব্যবসায় শিক্ষা (Commerce) গ্রুপ
  { name: "হিসাববিজ্ঞান", group: "commerce", order: 20 },
  { name: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা", group: "commerce", order: 21 },
  { name: "ফিন্যান্স, ব্যাংকিং ও বিমা", group: "commerce", order: 22 },
  { name: "উৎপাদন ব্যবস্থাপনা ও বিপণন", group: "commerce", order: 23 },
  // মানবিক (Arts) গ্রুপ
  { name: "ইতিহাস", group: "arts", order: 30 },
  { name: "পৌরনীতি ও সুশাসন", group: "arts", order: 31 },
  { name: "অর্থনীতি", group: "arts", order: 32 },
  { name: "যুক্তিবিদ্যা", group: "arts", order: 33 },
  { name: "সমাজবিজ্ঞান", group: "arts", order: 34 },
  { name: "ভূগোল ও পরিবেশ", group: "arts", order: 35 },
];

const classes: ClassDraft[] = [
  { id: "class6", name: "Class 6", hasGroups: false, subjects: juniorSubjects },
  { id: "class7", name: "Class 7", hasGroups: false, subjects: juniorSubjects },
  { id: "class8", name: "Class 8", hasGroups: false, subjects: juniorSubjects },
  { id: "class9_10", name: "Class 9-10 (SSC)", hasGroups: true, subjects: ssc },
  { id: "class11_12", name: "Class 11-12 (HSC)", hasGroups: true, subjects: hsc },
];

async function seedClasses() {
  const { adminDb } = await import("../lib/firebase-admin");

  console.log("classes আর subjects বসানো শুরু হচ্ছে...");

  for (const cls of classes) {
    const { subjects, ...classData } = cls;

    // ক্লাসের নিজের document
    await adminDb.collection("classes").doc(cls.id).set(classData);
    console.log(`✅ ক্লাস বসানো হয়েছে: ${cls.id}`);

    // প্রতিটা subject একটা batch দিয়ে একসাথে বসানো হচ্ছে (দ্রুত ও কম রিকোয়েস্টে)
    const batch = adminDb.batch();
    subjects.forEach((subject, index) => {
      const subjectRef = adminDb
        .collection("classes")
        .doc(cls.id)
        .collection("subjects")
        .doc(`subject_${index + 1}`);
      batch.set(subjectRef, subject);
    });
    await batch.commit();
    console.log(`   → ${subjects.length}টা subject বসানো হয়েছে`);
  }

  console.log("সব ক্লাস ও বিষয় সফলভাবে বসানো হয়েছে!");
  process.exit(0);
}

seedClasses().catch((err) => {
  console.error("সমস্যা হয়েছে:", err);
  process.exit(1);
});