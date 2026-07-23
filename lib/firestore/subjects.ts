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
  classId: string
): Promise<FirestoreSubject[]> {
  const q = query(
    collection(db, "subjects"),
    where("classId", "==", classId),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FirestoreSubject, "id">),
  }));
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