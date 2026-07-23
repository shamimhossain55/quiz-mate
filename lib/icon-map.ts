import {
  Atom,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Landmark,
  Languages,
  LucideIcon,
  GraduationCap,
  Building2,
  TrendingUp,
  Scale,
  Map,
  ScrollText,
  Briefcase,
  Dna,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  // Common
  book: BookOpen,
  languages: Languages,
  calculator: Calculator,
  flask: FlaskConical,
  atom: Atom,
  globe: Globe,
  landmark: Landmark,

  // Science
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  higher_math: Calculator,

  // Commerce
  accounting: TrendingUp,
  finance: Building2,
  business: Briefcase,
  marketing: Briefcase,

  // Arts
  economics: TrendingUp,
  geography: Map,
  history: ScrollText,
  civics: Scale,
  sociology: GraduationCap,
  logic: BookOpen,

  // Default
  default: BookOpen,
};