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
  if (!subjectId) return [];

  const decodedId = decodeURIComponent(subjectId);
  const candidatesSet = new Set<string>([
    subjectId,
    decodedId,
  ]);

  if (decodedId.includes("_")) {
    const parts = decodedId.split("_");
    const withoutPrefix = parts.slice(1).join("_");
    candidatesSet.add(withoutPrefix);
    candidatesSet.add(encodeURIComponent(withoutPrefix));
  } else {
    candidatesSet.add(`class6_${decodedId}`);
    candidatesSet.add(`class7_${decodedId}`);
    candidatesSet.add(`class8_${decodedId}`);
    candidatesSet.add(`class9_${decodedId}`);
    candidatesSet.add(`class10_${decodedId}`);
  }

  const candidates = Array.from(candidatesSet).filter(Boolean);

  try {
    const q = query(
      collection(db, "chapters"),
      where("subjectId", "in", candidates.slice(0, 10))
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Chapter, "id">),
      }));
      docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      return docs;
    }
  } catch (err) {
    console.error("Error with 'in' query for chapters:", err);
  }

  // Fallback: Fetch all chapters and match manually if specific query produced no results
  try {
    const snapshot = await getDocs(collection(db, "chapters"));
    if (snapshot.empty) return [];

    const matchedDocs = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Chapter, "id">),
      }))
      .filter((ch) => {
        if (!ch.subjectId) return false;
        const chSubId = ch.subjectId;
        const decodedChSubId = decodeURIComponent(chSubId);
        return (
          candidates.includes(chSubId) ||
          candidates.includes(decodedChSubId) ||
          chSubId.toLowerCase().includes(decodedId.toLowerCase()) ||
          decodedId.toLowerCase().includes(chSubId.toLowerCase())
        );
      });

    matchedDocs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return matchedDocs;
  } catch (err) {
    console.error("Fallback error fetching chapters:", err);
    return [];
  }
}

let chaptersMemoryCache: { data: Chapter[]; timestamp: number } | null = null;

export function clearChapterCache(): void {
  chaptersMemoryCache = null;
}

export async function getAllChapters(): Promise<Chapter[]> {
  if (chaptersMemoryCache && Date.now() - chaptersMemoryCache.timestamp < 30000) {
    return chaptersMemoryCache.data;
  }
  try {
    const snapshot = await getDocs(collection(db, "chapters"));
    if (snapshot.empty) return [];
    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Chapter, "id">),
    }));
    docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    chaptersMemoryCache = {
      data: docs,
      timestamp: Date.now(),
    };
    return docs;
  } catch (err) {
    console.error("Error fetching all chapters:", err);
    return [];
  }
}

export function matchChapterToSubject(
  chapter: Chapter,
  subject: { id: string; slug?: string; classId?: string }
): boolean {
  if (!chapter || !chapter.subjectId) return false;
  const chSub = chapter.subjectId.toLowerCase().trim();
  const subId = (subject.id || "").toLowerCase().trim();
  const subSlug = (subject.slug || "").toLowerCase().trim();

  // 1. Direct match with subject.id or subject.slug
  if (chSub === subId || (subSlug && chSub === subSlug)) return true;

  // 2. Class prefix normalized matching (e.g. "class6_bangla" vs "bangla")
  const cleanChSub = chSub.replace(/^class\d+(_\d+)?_/, "");
  const cleanSubId = subId.replace(/^class\d+(_\d+)?_/, "");
  const cleanSlug = subSlug.replace(/^class\d+(_\d+)?_/, "");

  if (cleanChSub && (cleanChSub === cleanSubId || (cleanSlug && cleanChSub === cleanSlug))) {
    if (subject.classId) {
      const cls = subject.classId.toLowerCase();
      if (chSub.startsWith(cls) || !chSub.startsWith("class")) {
        return true;
      }
    } else {
      return true;
    }
  }

  // 3. Chapter ID prefix match (e.g. "class6_bangla_ch1" belongs to "class6_bangla" or "bangla")
  const chId = (chapter.id || "").toLowerCase().trim();
  if (subId && (chId.startsWith(`${subId}_`) || chId.startsWith(`${subId}-`))) {
    return true;
  }
  if (subSlug && (chId.startsWith(`${subSlug}_`) || chId.startsWith(`${subSlug}-`))) {
    return true;
  }

  return false;
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