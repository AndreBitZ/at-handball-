import { cn } from "../lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <circle cx="16" cy="16" r="13" fill="hsl(var(--primary))" />
        <path
          d="M16 3c-7 5-7 21 0 26M16 3c7 5 7 21 0 26M3.5 12.5c8 4 17 4 25 0"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
      <span className="font-display text-xl font-black tracking-tight">
        RESINA
      </span>
    </span>
  );
}
