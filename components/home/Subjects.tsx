import SubjectCard from "@/components/ui/SubjectCard";
import {
  BookOpen,
  Calculator,
  Languages,
  Laptop,
  FlaskConical,
  Globe,
  Landmark,
  ArrowRight,
} from "lucide-react";

const subjects = [
  {
    title: "বাংলা",
    description: "বাংলা ১ম ও ২য় পত্রের সকল অধ্যায়।",
    icon: BookOpen,
    href: "/subjects/bangla",
  },
  {
    title: "English",
    description: "Grammar, Reading এবং Writing Practice।",
    icon: Languages,
    href: "/subjects/english",
  },
  {
    title: "Mathematics",
    description: "প্রতিদিন গণিত অনুশীলন করুন।",
    icon: Calculator,
    href: "/subjects/math",
  },
  {
    title: "ICT",
    description: "তথ্য ও যোগাযোগ প্রযুক্তি।",
    icon: Laptop,
    href: "/subjects/ict",
  },
  {
    title: "Science",
    description: "Physics, Chemistry, Biology।",
    icon: FlaskConical,
    href: "/subjects/science",
  },
  {
    title: "BGS",
    description: "বাংলাদেশ ও বিশ্বপরিচয়।",
    icon: Globe,
    href: "/subjects/bgs",
  },
  {
    title: "Religion",
    description: "ধর্ম ও নৈতিক শিক্ষা।",
    icon: Landmark,
    href: "/subjects/religion",
  },
  {
    title: "আরও আসছে",
    description: "নতুন বিষয় খুব শীঘ্রই যুক্ত হবে।",
    icon: ArrowRight,
    href: "#",
  },
];

export default function Subjects() {
  return (
    <section id="subjects" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            📚 জনপ্রিয় বিষয়সমূহ
          </span>

          <h2 className="mt-6 text-4xl font-bold text-slate-900">
            আপনার পছন্দের বিষয় দিয়ে শুরু করুন
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Class 7–12 শিক্ষার্থীদের জন্য সাজানো বিষয়ভিত্তিক Quiz এবং অধ্যায়ভিত্তিক অনুশীলন।
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.title}
              title={subject.title}
              description={subject.description}
              icon={subject.icon}
              href={subject.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}