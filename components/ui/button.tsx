"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" | "muted" }
>(({ className, variant = "primary", disabled, ...rest }, ref) => (
  <button
    ref={ref}
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 disabled:pointer-events-none disabled:opacity-45 active:translate-y-[0.5px]",
      variant === "primary" &&
        "bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-500 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] hover:brightness-[1.04]",
      variant === "outline" &&
        "border border-white/15 bg-white/5 text-slate-50 hover:bg-white/[0.07]",
      variant === "ghost" && "border border-transparent text-sky-300 hover:bg-white/5",
      variant === "muted" && "bg-white/10 text-white/85 hover:bg-white/15",
      className,
    )}
    {...rest}
  />
));
Button.displayName = "Button";
