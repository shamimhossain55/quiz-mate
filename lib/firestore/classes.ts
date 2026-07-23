import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase-client";

export interface Class {
  id: string;
  name: string;
  order: number;
  hasGroups: boolean;
}

export async function getClasses(): Promise<Class[]> {
  const q = query(
    collection(db, "classes"),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Class, "id">),
  }));
}