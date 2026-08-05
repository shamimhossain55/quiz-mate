import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase-client";
import { FirestoreSubject } from "@/types/firestore";

function isClassMatching(subjectClassId?: string, studentClassId?: string): boolean {
  if (!studentClassId || !subjectClassId) return true;
  if (subjectClassId === studentClassId) return true;

  // SSC group (Class 9, Class 10, SSC)
  const sscClasses = ["class9", "class10", "class9_10"];
  if (sscClasses.includes(subjectClassId) && sscClasses.includes(studentClassId)) {
    return true;
  }

  // HSC group (Class 11, Class 12, HSC)
  const hscClasses = ["class11", "class12", "class11_12"];
  if (hscClasses.includes(subjectClassId) && hscClasses.includes(studentClassId)) {
    return true;
  }

  return false;
}

let subjectsMemoryCache: { [key: string]: { data: FirestoreSubject[]; timestamp: number } } = {};

export function clearSubjectCache(): void {
  subjectsMemoryCache = {};
}

/**
 * Dashboard-এর জন্য
 */
export async function getSubjects(
  classId?: string,
  group?: string
): Promise<FirestoreSubject[]> {
  const cacheKey = `${classId || "all"}_${group || "all"}`;
  const cached = subjectsMemoryCache[cacheKey];
  // 30 seconds memory cache for fast client navigation
  if (cached && Date.now() - cached.timestamp < 30000) {
    return cached.data;
  }

  try {
    const colRef = collection(db, "subjects");
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return [];
    }

    let docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<FirestoreSubject, "id">),
    }));

    // 1. Filter by classId (স্মার্ট ম্যাচিং সহ)
    if (classId) {
      const filteredByClass = docs.filter((s) => isClassMatching(s.classId, classId));
      // যদি ওই ক্লাসের বিষয় ফায়ারবেসে থাকে তবে শুধু সেগুলোই দেখাবে,
      // আর যদি ফায়ারবেসে ওই ক্লাসের বিষয় না থাকে তবে ফলব্যাক হিসেবে অল বিষয় দেখাবে
      if (filteredByClass.length > 0) {
        docs = filteredByClass;
      }
    }

    // 2. Group filter — সঠিক logic:
    //    - subject.group === "all" (বা undefined) → সকল স্টুডেন্ট দেখবে
    //    - subject.group === "science" → শুধু science স্টুডেন্ট
    //    - subject.group === "commerce" → শুধু commerce স্টুডেন্ট
    //    - subject.group === "arts" → শুধু arts স্টুডেন্ট
    docs = docs.filter((s) => {
      const subjectGroup = (s.group || "all").toLowerCase();
      if (subjectGroup === "all") return true;
      if (!group || group.toLowerCase() === "all") return false;
      return subjectGroup === group.toLowerCase();
    });

    // Client-side sort by order
    docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    subjectsMemoryCache[cacheKey] = {
      data: docs,
      timestamp: Date.now(),
    };

    return docs;
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return [];
  }
}


/**
 * subject document id দিয়ে
 * যেমন: class6_bangla
 */
export async function getSubjectById(
  subjectId: string
): Promise<FirestoreSubject | null> {
  const snapshot = await getDoc(
    doc(db, "subjects", subjectId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<FirestoreSubject, "id">),
  };
}

/**
 * slug দিয়ে subject বের করার জন্য
 * যেমন: bangla
 */
export async function getSubjectBySlug(
  slug: string
): Promise<FirestoreSubject | null> {
  const q = query(
    collection(db, "subjects"),
    where("slug", "==", slug)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const subject = snapshot.docs[0];

  return {
    id: subject.id,
    ...(subject.data() as Omit<FirestoreSubject, "id">),
  };
}