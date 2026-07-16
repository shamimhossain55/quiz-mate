import {
  BookOpen,
  Calculator,
  Atom,
  Globe,
  Landmark,
  Languages,
  LucideIcon,
} from "lucide-react";

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  chapters: number;
}

export const subjects: Subject[] = [
  {
    id: "bangla",
    name: "Bangla",
    description: "Grammar, Literature & Writing",
    icon: Languages,
    color: "text-rose-500",
    chapters: 18,
  },
  {
    id: "english",
    name: "English",
    description: "Grammar, Reading & Vocabulary",
    icon: BookOpen,
    color: "text-blue-500",
    chapters: 20,
  },
  {
    id: "math",
    name: "Mathematics",
    description: "Practice with problem solving",
    icon: Calculator,
    color: "text-emerald-500",
    chapters: 22,
  },
  {
    id: "science",
    name: "Science",
    description: "Physics, Chemistry & Biology",
    icon: Atom,
    color: "text-violet-500",
    chapters: 16,
  },
  {
    id: "ict",
    name: "ICT",
    description: "Digital skills & technology",
    icon: Globe,
    color: "text-cyan-500",
    chapters: 12,
  },
  {
    id: "religion",
    name: "Religion",
    description: "Values & moral education",
    icon: Landmark,
    color: "text-amber-500",
    chapters: 14,
  },
];