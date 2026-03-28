import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: ReactNode
  glowColor?: "cyan" | "purple"
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  glowColor = "cyan",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl p-6",
        "bg-[rgba(15,15,20,0.6)] backdrop-blur-xl",
        "border border-[rgba(255,255,255,0.08)]",
        "transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        glowColor === "cyan" ? "hover:glow-border-cyan" : "hover:glow-border-purple"
      )}
    >
      {/* Corner accent */}
      <div
        className={cn(
          "absolute top-0 right-0 w-20 h-20 opacity-20",
          "bg-gradient-to-bl",
          glowColor === "cyan"
            ? "from-neon-cyan/30 to-transparent"
            : "from-neon-purple/30 to-transparent"
        )}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <div
            className={cn(
              "p-2 rounded-lg",
              glowColor === "cyan"
                ? "bg-neon-cyan/10 text-neon-cyan"
                : "bg-neon-purple/10 text-neon-purple"
            )}
          >
            {icon}
          </div>
        </div>

        <div
          className={cn(
            "text-3xl font-bold mb-2",
            glowColor === "cyan" ? "text-neon-cyan text-glow-cyan" : "text-neon-purple text-glow-purple"
          )}
        >
          {value}
        </div>

        {change && (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-xs font-medium",
                changeType === "positive" && "text-emerald-400",
                changeType === "negative" && "text-red-400",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </span>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        )}
      </div>

      {/* Animated border glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          "pointer-events-none",
          glowColor === "cyan"
            ? "shadow-[inset_0_0_30px_rgba(0,212,255,0.1)]"
            : "shadow-[inset_0_0_30px_rgba(139,92,246,0.1)]"
        )}
      />
    </div>
  )
}
