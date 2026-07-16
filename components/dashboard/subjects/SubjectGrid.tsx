"use client";

import { useRouter } from "next/navigation";

import SubjectCard from "./SubjectCard";
import { subjects } from "./subjects";

export default function SubjectGrid() {
  const router = useRouter();

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          onClick={() =>
            router.push(`/subject/${subject.id}`)
          }
        />
      ))}
    </div>
  );
}