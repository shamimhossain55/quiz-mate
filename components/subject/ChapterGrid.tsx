import ChapterCard from "./ChapterCard";
import { chapters } from "./chapters";

export default function ChapterGrid() {
  return (
    <div className="grid gap-6">
      {chapters.map((chapter) => (
        <ChapterCard
          key={chapter.id}
          chapter={chapter}
        />
      ))}
    </div>
  );
}