"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import SubjectCard from "./SubjectCard";

import { iconMap } from "@/lib/icon-map";

import { FirestoreSubject } from "@/types/firestore";

type SubjectCardData = FirestoreSubject & {
  iconComponent: React.ElementType;
};

export default function SubjectGrid() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<SubjectCardData[]>([]);

  useEffect(() => {
    async function load() {
      // ✅ /api/subjects — server-side student-এর নিজের classId দিয়ে filter করে
      const res = await fetch("/api/subjects");
      if (!res.ok) return;
      const data = await res.json();

      const mappedSubjects: SubjectCardData[] = (data.subjects ?? []).map(
        (subject: any) => ({
          ...subject,
          iconComponent: iconMap[subject.icon] ?? iconMap.default,
        })
      );

      setSubjects(mappedSubjects);
    }

    load();
  }, []);

  return (
    <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          onClick={() =>
            router.push(`/subject/${subject.slug}`)
          }
        />
      ))}
    </div>
  );
}