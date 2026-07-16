import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-lg",

  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200",

  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",

  danger:
    "bg-red-600 text-white hover:bg-red-700",
};

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        `
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        px-5
        py-3
        text-sm
        font-semibold
        transition-all
        duration-300
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-50
        `,
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}