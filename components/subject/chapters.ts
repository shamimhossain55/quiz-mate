export interface Chapter {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  estimatedTime: string;
}

export const chapters: Chapter[] = [
  {
    id: "chapter-1",
    title: "Real Numbers",
    description: "Learn the fundamentals of real numbers.",
    questionCount: 25,
    estimatedTime: "20 min",
  },
  {
    id: "chapter-2",
    title: "Sets",
    description: "Understand set theory and operations.",
    questionCount: 18,
    estimatedTime: "15 min",
  },
  {
    id: "chapter-3",
    title: "Algebra",
    description: "Practice algebraic expressions and equations.",
    questionCount: 30,
    estimatedTime: "25 min",
  },
  {
    id: "chapter-4",
    title: "Geometry",
    description: "Lines, angles, triangles and circles.",
    questionCount: 22,
    estimatedTime: "20 min",
  },
  {
    id: "chapter-5",
    title: "Statistics",
    description: "Charts, graphs and data analysis.",
    questionCount: 15,
    estimatedTime: "15 min",
  },
];