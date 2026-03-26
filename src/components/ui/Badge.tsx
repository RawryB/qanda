import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type BadgeVariant = "live" | "draft";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClass: Record<BadgeVariant, string> = {
  live: "border-transparent bg-[var(--success-bg)] text-[var(--success-fg)]",
  draft: "border-[var(--border-subtle)] bg-[var(--bg-field)] text-[var(--text-muted)]",
};

export function Badge({ className, variant = "draft", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[999px] border px-2 py-0.5 font-[var(--font-syne)] text-[10px] font-bold uppercase tracking-[0.08em]",
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}
