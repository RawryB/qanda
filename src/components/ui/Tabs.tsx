import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "./cn";

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center border-b border-[var(--border-subtle)]", className)} {...props} />;
}

type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function Tab({ className, active = false, type = "button", ...props }: TabProps) {
  return (
    <button
      type={type}
      className={cn(
        "mb-[-1px] border-b-2 border-transparent px-4 py-2 font-[var(--font-syne)] text-[12px] font-bold text-[var(--text-muted)] transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        active && "border-b-[var(--text-primary)] text-[var(--text-primary)]",
        className,
      )}
      {...props}
    />
  );
}
