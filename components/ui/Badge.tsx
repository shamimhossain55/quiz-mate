import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "secondary";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants = {
  primary:
    "bg-blue-100 text-blue-700 border border-blue-200",

  success:
    "bg-emerald-100 text-emerald-700 border border-emerald-200",

  warning:
    "bg-amber-100 text-amber-700 border border-amber-200",

  danger:
    "bg-red-100 text-red-700 border border-red-200",

  secondary:
    "bg-slate-100 text-slate-700 border border-slate-200",
};

export default function Badge({
  children,
  variant = "primary",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        `
        inline-flex
        items-center
        justify-center
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        transition-all
        duration-300
        `,
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}