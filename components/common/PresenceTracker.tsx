"use client";

/**
 * components/common/PresenceTracker.tsx
 *
 * Invisible component that sets up the current user's real-time
 * presence in RTDB as soon as they are authenticated.
 * Rendered once inside Providers so every page benefits automatically.
 */

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { setupUserPresence } from "@/lib/rtdb/chat-service";

export default function PresenceTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    const cleanup = setupUserPresence(session.user.email);
    return cleanup;
  }, [status, session?.user?.email]);

  // Renders nothing — purely side-effect
  return null;
}
