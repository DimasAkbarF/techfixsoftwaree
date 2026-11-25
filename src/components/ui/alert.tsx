import * as React from "react";
import { cn } from "@/lib/utils";
import { IconAlertCircle, IconCheck, IconInfoCircle } from "@tabler/icons-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "danger" | "warning";
}

export function Alert({
  className,
  variant = "default",
  children,
  ...props
}: AlertProps) {
  const variantStyles = {
    default: "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)]",
    success: "border-[#CEEAD6] bg-[#E6F4EA] text-[var(--color-success)]",
    danger: "border-[#FAD2CF] bg-[#FCE8E6] text-[var(--color-danger)]",
    warning: "border-[#FEEFC3] bg-[#FEF7E0] text-[var(--color-warning)]",
  };

  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-[var(--radius)] border p-4 text-sm flex items-start gap-3",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {variant === "danger" && <IconAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
      {variant === "success" && <IconCheck className="w-5 h-5 shrink-0 mt-0.5" />}
      {variant === "warning" && <IconAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
      {variant === "default" && <IconInfoCircle className="w-5 h-5 shrink-0 mt-0.5" />}
      <div className="flex-1">{children}</div>
    </div>
  );
}
