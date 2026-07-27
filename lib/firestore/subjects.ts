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

/**
 * Dashboard-এর জন্য
 */
export async function getSubjects(
  classId?: string,
  group?: string
): Promise<FirestoreSubject[]> {
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

    // Filter by classId if provided and matching subjects exist
    if (classId) {
      const filteredByClass = docs.filter((s) => s.classId === classId);
      if (filteredByClass.length > 0) {
        docs = filteredByClass;
      }
    }

    // Filter by group if specified (shows subject if group is missing, 'all', or matches student's group)
    if (group && group !== "all") {
      const filteredByGroup = docs.filter(
        (s) => !s.group || s.group === "all" || s.group === group
      );
      if (filteredByGroup.length > 0) {
        docs = filteredByGroup;
      }
    }

    // Client-side sort by order or name
    docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

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