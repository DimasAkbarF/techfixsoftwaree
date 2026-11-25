import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "secondary" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[var(--color-primary)] text-white",
    success: "bg-[#E6F4EA] text-[var(--color-success)] border border-[#CEEAD6]",
    warning: "bg-[#FEF7E0] text-[var(--color-warning)] border border-[#FEEFC3]",
    danger: "bg-[#FCE8E6] text-[var(--color-danger)] border border-[#FAD2CF]",
    secondary: "bg-[var(--color-border)] text-[var(--color-secondary)]",
    outline: "border border-[var(--color-border)] text-[var(--color-fg)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-[var(--radius)] transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
