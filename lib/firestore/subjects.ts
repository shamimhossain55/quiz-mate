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
  if (!studentClassId || !subjectClassId) return false;
  // Exact match
  if (subjectClassId === studentClassId) return true;
  // class9_10 subject is visible to class9 and class10 students
  if (subjectClassId === "class9_10" && (studentClassId === "class9" || studentClassId === "class10" || studentClassId === "class9_10")) return true;
  // class11_12 subject is visible to class11 and class12 students
  if (subjectClassId === "class11_12" && (studentClassId === "class11" || studentClassId === "class12" || studentClassId === "class11_12")) return true;
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

    // 1. Strict filter by classId — only show subjects for the student's exact class
    if (classId) {
      docs = docs.filter((s) => isClassMatching(s.classId, classId));
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