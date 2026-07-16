import SubjectGrid from "./SubjectGrid";
import { BookOpen } from "lucide-react";

export default function SubjectSection() {
  return (
    <section className="mt-10">

      <div className="mb-8 flex items-start justify-between gap-4">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
              <BookOpen
                className="text-blue-600"
                size={24}
              />
            </div>

            <div>

              <h2 className="text-3xl font-bold text-slate-900">
                Choose Your Subject
              </h2>

              <p className="mt-1 text-slate-500">
                Select a subject and continue your learning journey.
              </p>

            </div>

          </div>

        </div>

      </div>

      <SubjectGrid />

    </section>
  );
}