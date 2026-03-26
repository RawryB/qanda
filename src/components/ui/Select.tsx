import type { SelectHTMLAttributes } from "react";
import { cn } from "./cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-field)] px-3 py-2 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        className,
      )}
      {...props}
    />
  );
}
