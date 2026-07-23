"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2 } from "lucide-react";

type ClassOption = {
  id: string;
  name: string;
  hasGroups: boolean;
};

const GROUPS: { id: string; label: string }[] = [
  { id: "science", label: "বিজ্ঞান" },
  { id: "commerce", label: "ব্যবসায় শিক্ষা" },
  { id: "arts", label: "মানবিক" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    async function loadInitial() {
      try {
        // যদি আগেই profile complete করা থাকে, dashboard এ পাঠিয়ে দাও
        const studentRes = await fetch("/api/student-data");
        if (studentRes.ok) {
          const { student } = await studentRes.json();
          if (student?.profileComplete) {
            router.replace("/dashboard");
            return;
          }
        }

        const classesRes = await fetch("/api/classes");
        if (!classesRes.ok) throw new Error("ক্লাস তালিকা আনতে সমস্যা হয়েছে");
        const { classes } = await classesRes.json();
        setClasses(classes);
      } catch (err) {
        console.error(err);
        setError("তথ্য আনতে সমস্যা হয়েছে, একটু পর আবার চেষ্টা করো");
      } finally {
        setLoadingClasses(false);
      }
    }

    if (status === "authenticated") {
      loadInitial();
    }
  }, [status, router]);

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null;
  const needsGroup = selectedClass?.hasGroups ?? false;
  const canSubmit = Boolean(selectedClassId) && (!needsGroup || Boolean(selectedGroup));

  function handleSelectClass(classId: string) {
    setSelectedClassId(classId);
    setSelectedGroup(null); // ক্লাস পাল্টালে আগের group রিসেট
    setError(null);
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/student-data/class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClassId, group: selectedGroup }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "সেভ করতে সমস্যা হয়েছে");
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "সেভ করতে সমস্যা হয়েছে");
      setSubmitting(false);
    }
  }

  if (status === "loading" || loadingClasses) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col">
      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0">
        <div className="px-5 pt-8 pb-4 flex-shrink-0">
          <p className="text-lg font-medium text-slate-900">তোমার ক্লাস বেছে নাও</p>
          <p className="text-sm text-slate-500 mt-1">
            এটার ভিত্তিতে তোমার জন্য সঠিক বিষয় ও কুইজ দেখানো হবে
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">
          <div className="flex flex-col gap-2.5">
            {classes.map((cls) => {
              const isSelected = cls.id === selectedClassId;
              return (
                <button
                  key={cls.id}
                  onClick={() => handleSelectClass(cls.id)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3.5 border text-left transition-colors active:scale-[0.98] ${
                    isSelected
                      ? "border-teal-600 bg-teal-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? "text-teal-700" : "text-slate-800"
                    }`}
                  >
                    {cls.name}
                  </span>
                  {isSelected && <CheckCircle2 width={18} height={18} className="text-teal-600" />}
                </button>
              );
            })}
          </div>

          {needsGroup && (
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-500 mb-2.5">গ্রুপ বেছে নাও</p>
              <div className="flex flex-col gap-2.5">
                {GROUPS.map((grp) => {
                  const isSelected = grp.id === selectedGroup;
                  return (
                    <button
                      key={grp.id}
                      onClick={() => {
                        setSelectedGroup(grp.id);
                        setError(null);
                      }}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3.5 border text-left transition-colors active:scale-[0.98] ${
                        isSelected
                          ? "border-teal-600 bg-teal-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? "text-teal-700" : "text-slate-800"
                        }`}
                      >
                        {grp.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 width={18} height={18} className="text-teal-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-rose-600 mt-4 text-center">{error}</p>
          )}
        </div>

        <div className="flex-shrink-0 px-5 pb-6 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full rounded-2xl bg-teal-600 text-white text-sm font-medium py-3.5 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
          >
            {submitting ? "সেভ হচ্ছে..." : "শুরু করি"}
          </button>
        </div>
      </div>
    </div>
  );
}