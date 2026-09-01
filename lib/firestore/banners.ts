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
  if (typeof window !== "undefined") {
    try {
      const ls = localStorage.getItem("qm_banners_cache");
      if (ls) {
        const parsed = JSON.parse(ls);
        if (parsed.timestamp && Date.now() - parsed.timestamp < BANNER_CACHE_TTL_MS && Array.isArray(parsed.data)) {
          bannersCache = parsed;
          return parsed.data;
        }
      }
    } catch {}
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
    const cacheObj = { data: docs, timestamp: Date.now() };
    bannersCache = cacheObj;
    if (typeof window !== "undefined") {
      try { localStorage.setItem("qm_banners_cache", JSON.stringify(cacheObj)); } catch {}
    }
    return docs;
  } catch (err) {
    console.error("Error fetching banners:", err);
    return [];
  }
}

