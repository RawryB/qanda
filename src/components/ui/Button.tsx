import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "ghost" | "accent";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-[6px] border px-3 py-2 transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "font-[var(--font-syne)] text-[12px] font-bold border-transparent bg-[var(--text-primary)] text-[var(--bg-app)] hover:opacity-90",
  ghost:
    "font-[var(--font-syne)] text-[12px] font-bold border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-field)] hover:text-[var(--text-primary)]",
  accent:
    "font-[var(--font-syne)] text-[12px] font-bold border-transparent bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-8 px-3",
  md: "h-9 px-4",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(baseClass, variantClass[variant], sizeClass[size], className)}
      {...props}
    />
  );
}
