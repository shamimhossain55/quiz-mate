import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  imageUrl?: string;
  linkUrl?: string;
  ctaText?: string;
  bgGradient?: string;
  order?: number;
}

export async function getActiveBanners(): Promise<BannerSlide[]> {
  try {
    const colRef = collection(db, "banners");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return [];
    }
    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<BannerSlide, "id">),
    }));
    docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return docs;
  } catch (err) {
    console.error("Error fetching banners:", err);
    return [];
  }
}
