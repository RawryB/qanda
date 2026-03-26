import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-panel)]", className)}
      {...props}
    />
  );
}
