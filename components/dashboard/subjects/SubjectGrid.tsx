"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import SubjectCard from "./SubjectCard";

import { getSubjects } from "@/lib/firestore/subjects";
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
      const firestoreSubjects = await getSubjects("class6");

      const mappedSubjects: SubjectCardData[] =
        firestoreSubjects.map((subject) => ({
          ...subject,
          iconComponent:
            iconMap[subject.icon] ?? iconMap.default,
        }));

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