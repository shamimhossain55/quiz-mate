"use client";

/**
 * components/community/MessageStatusTick.tsx
 *
 * WhatsApp-style message status tick component.
 *
 * Status mapping:
 *  - pending   → single faint clock-like check (slate-300)
 *  - sent      → single check ✓ (slate-400) — delivered to server, recipient offline
 *  - delivered → double check ✓✓ (slate-400) — recipient online but hasn't read
 *  - seen      → double check ✓✓ (teal-500, bold) — recipient read the message
 */

import { Check, CheckCheck } from "lucide-react";
import type { MessageStatus } from "@/lib/rtdb/chat-service";

interface MessageStatusTickProps {
  /** If pending (optimistic send), show faint single tick */
  pending?: boolean;
  /** Status from RTDB: "sent" | "delivered" | "seen" */
  status: MessageStatus;
  size?: number;
}

export default function MessageStatusTick({
  pending = false,
  status,
  size = 13,
}: MessageStatusTickProps) {
  if (pending) {
    return (
      <Check
        width={size}
        height={size}
        className="text-slate-300 stroke-[2]"
        aria-label="পাঠানো হচ্ছে"
      />
    );
  }

  if (status === "sent") {
    return (
      <Check
        width={size}
        height={size}
        className="text-slate-400 stroke-[2]"
        aria-label="পাঠানো হয়েছে"
      />
    );
  }

  if (status === "delivered") {
    return (
      <CheckCheck
        width={size}
        height={size}
        className="text-slate-400 stroke-[2]"
        aria-label="ডেলিভার হয়েছে"
      />
    );
  }

  // seen
  return (
    <CheckCheck
      width={size}
      height={size}
      className="text-teal-500 stroke-[2.5]"
      aria-label="দেখা হয়েছে"
    />
  );
}
