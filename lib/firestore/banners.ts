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

let bannersCache: { data: BannerSlide[]; timestamp: number } | null = null;
const BANNER_CACHE_TTL_MS = 15 * 60 * 1000;

export function clearBannerCache() {
  bannersCache = null;
}

export async function getActiveBanners(): Promise<BannerSlide[]> {
  if (bannersCache && Date.now() - bannersCache.timestamp < BANNER_CACHE_TTL_MS) {
    return bannersCache.data;
  }
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
    bannersCache = { data: docs, timestamp: Date.now() };
    return docs;
  } catch (err) {
    console.error("Error fetching banners:", err);
    return [];
  }
}

