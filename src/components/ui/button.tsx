import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:opacity-45 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[image:var(--cta-gradient)] font-bold text-[#041a14] shadow-[var(--cta-shadow)] hover:brightness-105 active:brightness-95",
      secondary:
        "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] active:brightness-95",
      outline:
        "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:bg-[#F1F4F6]",
      danger:
        "bg-[var(--color-danger)] text-white hover:brightness-110 active:brightness-95",
      ghost:
        "bg-transparent text-[var(--color-fg)] hover:bg-[#F1F4F6]",
    };

    const sizeStyles = {
      sm: "h-9 px-3 text-xs rounded-[var(--radius)]",
      md: "h-11 px-4 text-sm rounded-[var(--radius)]",
      lg: "h-12 px-6 text-base rounded-[var(--radius)]",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
