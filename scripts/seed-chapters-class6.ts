/**
 * classes/{classId}/subjects/{subjectId}/chapters কালেকশন বসানোর script
 *
 * ⚠️ এখন পর্যন্ত শুধু Class 6 - বাংলা (চারুপাঠ) বসানো আছে (NCTB ২০২৫ সংস্করণ অনুযায়ী,
 *    sattacademy.com এর "চারুপাঠ - ষষ্ঠ শ্রেণি" পেজ থেকে যাচাই করা)।
 *    ⚠️ একবার নিজের বই/PDF-এর সাথে মিলিয়ে দেখে নাও — সংস্করণভেদে সামান্য
 *    পার্থক্য থাকতে পারে (curriculum বার বার পরিবর্তন হয়েছে)।
 *
 * বাকি subject গুলো (ইংরেজি, গণিত, বিজ্ঞান, বাংলাদেশ ও বিশ্বপরিচয়,
 * তথ্য ও যোগাযোগ প্রযুক্তি, ধর্ম শিক্ষা) এখনো বাকি — pattern approve হলে যোগ করব।
 *
 * চালানোর নিয়ম:
 *   npx tsx scripts/seed-chapters-class6.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
// ⚠️ adminDb কে dynamic import দিয়ে আনা হচ্ছে, যাতে dotenv এর config() লোড হওয়ার
//    আগেই firebase-admin.ts রান না হয়ে যায় (ES module import hoisting এর কারণে
//    static import উপরের config() এর আগেই চলে যেত)

type ChapterDraft = {
  name: string;
  author?: string;
  order: number;
};

type SubjectChapters = {
  subjectDocId: string; // classes/{classId}/subjects/{subjectDocId}
  chapters: ChapterDraft[];
};

const CLASS_ID = "class6";

// subject_1 = বাংলা (seed-classes.ts এর juniorSubjects অনুযায়ী ক্রম মিলিয়ে বসানো)
const banglaChapters: ChapterDraft[] = [
  { name: "সততার পুরস্কার", author: "মুহম্মদ শহীদুল্লাহ", order: 1 },
  { name: "মিনু", author: "বনফুল", order: 2 },
  { name: "নীল নদ আর পিরামিডের দেশ", author: "সৈয়দ মুজতবা আলী", order: 3 },
  { name: "তোলপাড়", author: "শওকত ওসমান", order: 4 },
  { name: "আকাশ", author: "আবদুল্লাহ আল-মুতী", order: 5 },
  { name: "মাদার তেরেসা", author: "সন্‌জীদা খাতুন", order: 6 },
  { name: "আমাদের লোকশিল্প", author: "কামরুল হাসান", order: 7 },
  { name: "কত কাল ধরে", author: "আনিসুজ্জামান", order: 8 },
  { name: "কার্টুন, ব্যঙ্গচিত্র ও পোস্টারের ভাষা", author: "সংকলিত", order: 9 },
  { name: "জন্মভূমি", author: "রবীন্দ্রনাথ ঠাকুর", order: 10 },
  { name: "সুখ", author: "কামিনী রায়", order: 11 },
  { name: "মানুষ জাতি", author: "সত্যেন্দ্রনাথ দত্ত", order: 12 },
  { name: "ঝিঙে ফুল", author: "কাজী নজরুল ইসলাম", order: 13 },
  { name: "আসমানি", author: "জসীমউদ্‌দীন", order: 14 },
  { name: "চিঠি বিলি", author: "রোকনুজ্জামান খান", order: 15 },
  { name: "বাঁচতে দাও", author: "শামসুর রাহমান", order: 16 },
  { name: "পাখির কাছে ফুলের কাছে", author: "আল মাহমুদ", order: 17 },
  { name: "ফাগুন মাস", author: "হুমায়ুন আজাদ", order: 18 },
];

// subject_4 = বিজ্ঞান (admissionwar.com এর গাইড পেজ থেকে যাচাই করা, NCTB ২০২৫)
const scienceChapters: ChapterDraft[] = [
  { name: "বৈজ্ঞানিক প্রক্রিয়া ও পরিমাপ", order: 1 },
  { name: "জীবজগৎ", order: 2 },
  { name: "উদ্ভিদ ও প্রাণীর কোষীয় সংগঠন", order: 3 },
  { name: "উদ্ভিদের বাহ্যিক বৈশিষ্ট্য", order: 4 },
  { name: "সালোকসংশ্লেষণ", order: 5 },
  { name: "সংবেদি অঙ্গ", order: 6 },
  { name: "পদার্থের বৈশিষ্ট্য এবং বাহ্যিক প্রভাব", order: 7 },
  { name: "মিশ্রণ", order: 8 },
  { name: "আলোর ঘটনা", order: 9 },
  { name: "গতি", order: 10 },
  { name: "বল এবং সরল যন্ত্র", order: 11 },
  { name: "পৃথিবীর উৎপত্তি ও গঠন", order: 12 },
  { name: "খাদ্য ও পুষ্টি", order: 13 },
  { name: "পরিবেশের ভারসাম্য এবং আমাদের জীবন", order: 14 },
];

// subject_5 = বাংলাদেশ ও বিশ্বপরিচয় (minibd.com এর ২০২৬ কারিকুলাম গাইড থেকে যাচাই করা)
const bgsChapters: ChapterDraft[] = [
  { name: "সমাজ বিবর্তনের ইতিহাস", order: 1 },
  { name: "বাংলাদেশ ও বিশ্বসভ্যতা", order: 2 },
  { name: "বাংলাদেশের সংস্কৃতি ও সমাজ", order: 3 },
  { name: "বাংলাদেশের অর্থনীতি", order: 4 },
  { name: "বাংলাদেশ ও বাংলাদেশের নাগরিক", order: 5 },
  { name: "বাংলাদেশের পরিবেশ", order: 6 },
  { name: "শিশুর বেড়ে ওঠা ও প্রতিবন্ধকতা: সামাজিকীকরণ", order: 7 },
  { name: "বাংলাদেশ ও আন্তর্জাতিক সহযোগিতা", order: 8 },
];

const subjectChaptersList: SubjectChapters[] = [
  { subjectDocId: "subject_1", chapters: banglaChapters }, // বাংলা
  { subjectDocId: "subject_4", chapters: scienceChapters }, // বিজ্ঞান
  { subjectDocId: "subject_5", chapters: bgsChapters }, // বাংলাদেশ ও বিশ্বপরিচয়
];

// ⚠️ এখনো বাকি: subject_6 (তথ্য ও যোগাযোগ প্রযুক্তি) ও subject_7 (ধর্ম শিক্ষা) —
//    এই দুইটার জন্য web-এ পাওয়া তালিকা অসম্পূর্ণ/অগোছালো ছিল বলে বাদ দেওয়া হয়েছে।
//    বইয়ের/PDF-এর সূচিপত্রের ছবি দিলে এগুলোও নির্ভুলভাবে বসিয়ে দেওয়া যাবে।

async function seedChapters() {
  const { adminDb } = await import("../lib/firebase-admin");

  console.log(`Class ${CLASS_ID} এর chapters বসানো শুরু হচ্ছে...`);

  for (const { subjectDocId, chapters } of subjectChaptersList) {
    const subjectRef = adminDb
      .collection("classes")
      .doc(CLASS_ID)
      .collection("subjects")
      .doc(subjectDocId);

    const batch = adminDb.batch();
    chapters.forEach((chapter, index) => {
      const chapterRef = subjectRef
        .collection("chapters")
        .doc(`chapter_${index + 1}`);
      batch.set(chapterRef, chapter);
    });
    await batch.commit();
    console.log(`   → ${subjectDocId}: ${chapters.length}টা chapter বসানো হয়েছে`);
  }

  console.log("সব chapter সফলভাবে বসানো হয়েছে!");
  process.exit(0);
}

seedChapters().catch((err) => {
  console.error("সমস্যা হয়েছে:", err);
  process.exit(1);
});