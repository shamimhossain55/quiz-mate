"use client";

import { X, UserCheck, Loader2, Bell, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type FriendRequestItem = {
  id: string;
  senderEmail: string;
  senderName: string;
  senderAvatar?: string | null;
  senderUid?: string;
  receiverEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

interface IncomingRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: FriendRequestItem[];
  onRespond: (requestId: string, action: "accept" | "decline") => void;
  respondingId?: string | null;
}

const avatarColors = [
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-rose-500", text: "text-white" },
  { bg: "bg-amber-500", text: "text-white" },
  { bg: "bg-emerald-500", text: "text-white" },
  { bg: "bg-violet-500", text: "text-white" },
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + h * 31;
  return avatarColors[Math.abs(h) % avatarColors.length];
}

export default function IncomingRequestsModal({
  isOpen,
  onClose,
  requests,
  onRespond,
  respondingId,
}: IncomingRequestsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Centered Modal */}
          <motion.div
            key="modal"
            initial={{ scale: 0.9, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
                  <Bell width={18} height={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                      Friend Requests
                    </h2>
                    {requests.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                        {requests.length}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-slate-400">
                    আপনাকে পাঠানো ফ্রেন্ড রিকোয়েস্ট সমূহ
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 active:scale-90 transition-transform cursor-pointer"
              >
                <X width={16} height={16} />
              </button>
            </div>

            {/* Requests list */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar min-h-[160px]">
              {requests.length > 0 ? (
                requests.map((req) => {
                  const ac = colorFor(req.senderName);
                  const isResponding = respondingId === req.id;
                  return (
                    <motion.div
                      key={req.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 flex items-center gap-3"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`h-12 w-12 rounded-full ${ac.bg} ring-2 ring-white flex items-center justify-center overflow-hidden shadow-xs`}
                        >
                          {req.senderAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={req.senderAvatar}
                              alt={req.senderName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className={`${ac.text} font-extrabold text-lg`}>
                              {req.senderName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info + Buttons */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <p className="text-[13px] font-extrabold text-slate-900 truncate leading-tight">
                              {req.senderName}
                            </p>
                            {req.senderUid && (
                              <p className="text-[9.5px] font-extrabold text-teal-700 mt-0.5">
                                #{req.senderUid}
                              </p>
                            )}
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                              {new Date(req.createdAt).toLocaleDateString("bn-BD", {
                                day: "numeric",
                                month: "short",
                              })} আগে
                            </p>
                          </div>
                        </div>

                        {/* Facebook Style Action Buttons */}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => onRespond(req.id, "accept")}
                            disabled={isResponding}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-teal-600 text-white text-[11px] font-extrabold active:scale-95 transition-all disabled:opacity-60 shadow-sm hover:bg-teal-700 cursor-pointer"
                          >
                            {isResponding ? (
                              <Loader2 width={12} height={12} className="animate-spin" />
                            ) : (
                              <UserCheck width={12} height={12} />
                            )}
                            Confirm
                          </button>
                          <button
                            onClick={() => onRespond(req.id, "decline")}
                            disabled={isResponding}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-[11px] font-extrabold active:scale-95 transition-all disabled:opacity-60 hover:bg-slate-300 cursor-pointer"
                          >
                            <X width={12} height={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                    <Sparkles width={22} height={22} className="text-rose-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">কোনো রিকোয়েস্ট জমা নেই</p>
                  <p className="text-[10px] text-slate-400">
                    কেউ আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠালে এখানে আসবে!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
