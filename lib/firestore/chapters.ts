import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase-client";
import { Chapter } from "@/types/firestore";

export async function getChapters(
  subjectId: string
): Promise<Chapter[]> {
  const q = query(
    collection(db, "chapters"),
    where("subjectId", "==", subjectId),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Chapter, "id">),
  }));
}

export async function getChapterById(id: string) {
  const snapshot = await getDocs(
    query(
      collection(db, "chapters"),
      where("id", "==", id)
    )
  );

  if (snapshot.empty) return null;

  return {
    id: snapshot.docs[0].id,
    ...(snapshot.docs[0].data() as Omit<Chapter, "id">),
  };
}