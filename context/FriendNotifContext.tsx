"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useSession } from "next-auth/react";

interface FriendNotifContextValue {
  pendingCount: number;
  unreadMsgCount: number;
  refresh: () => void;
}

const FriendNotifContext = createContext<FriendNotifContextValue>({
  pendingCount: 0,
  unreadMsgCount: 0,
  refresh: () => {},
});

/**
 * FriendNotifProvider
 * App-wide context that polls /api/friends/pending-count for incoming pending requests & unread messages.
 * Provides `pendingCount`, `unreadMsgCount` and a `refresh()` function to any child component.
 */
export function FriendNotifProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCount = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/friends/pending-count");
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.count ?? 0);
        setUnreadMsgCount(data.unreadMsgCount ?? 0);
      }
    } catch {
      // silently ignore network errors
    }
  }, [status]);

  // Poll every 30 seconds while authenticated
  useEffect(() => {
    if (status !== "authenticated") {
      setPendingCount(0);
      setUnreadMsgCount(0);
      return;
    }
    fetchCount();
    timerRef.current = setInterval(fetchCount, 30_000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, fetchCount]);

  return (
    <FriendNotifContext.Provider
      value={{ pendingCount, unreadMsgCount, refresh: fetchCount }}
    >
      {children}
    </FriendNotifContext.Provider>
  );
}

export function useFriendNotif() {
  return useContext(FriendNotifContext);
}
