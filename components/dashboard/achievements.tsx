import { cn } from "@/lib/utils"
import { Flag, Users, CheckCircle, Star, Shield, Award } from "lucide-react"

const badges = [
  {
    id: 1,
    name: "FIRST REPORT",
    description: "Submit your first issue",
    icon: Flag,
    unlocked: true,
    rarity: "common",
  },
  {
    id: 2,
    name: "COMMUNITY VOICE",
    description: "Get 100 upvotes on issues",
    icon: Users,
    unlocked: true,
    rarity: "rare",
  },
  {
    id: 3,
    name: "VERIFIED REPORTER",
    description: "10 issues verified by officials",
    icon: CheckCircle,
    unlocked: true,
    rarity: "epic",
  },
  {
    id: 4,
    name: "CITY HERO",
    description: "Reach Rank 50",
    icon: Star,
    unlocked: false,
    rarity: "legendary",
    progress: 84,
  },
  {
    id: 5,
    name: "GUARDIAN",
    description: "Report 100 resolved issues",
    icon: Shield,
    unlocked: false,
    rarity: "epic",
    progress: 78,
  },
  {
    id: 6,
    name: "ELITE CITIZEN",
    description: "Top 1% contributors",
    icon: Award,
    unlocked: false,
    rarity: "legendary",
    progress: 15,
  },
]

const rarityColors = {
  common: {
    bg: "bg-zinc-500/20",
    border: "border-zinc-500/30",
    text: "text-zinc-400",
    glow: "",
  },
  rare: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/30",
    text: "text-blue-400",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  },
  epic: {
    bg: "bg-neon-purple/20",
    border: "border-neon-purple/30",
    text: "text-neon-purple",
    glow: "shadow-[0_0_15px_rgba(139,92,246,0.3)]",
  },
  legendary: {
    bg: "bg-amber-500/20",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
  },
}

export function Badges() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6",
        "bg-[rgba(15,15,20,0.6)] backdrop-blur-xl",
        "border border-[rgba(255,255,255,0.08)]"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          CIVIC BADGES
        </h2>
        <span className="text-xs text-neon-cyan">3/6 Earned</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const colors = rarityColors[badge.rarity as keyof typeof rarityColors]
          const Icon = badge.icon

          return (
            <div
              key={badge.id}
              className={cn(
                "relative group p-4 rounded-lg transition-all duration-300",
                "border",
                badge.unlocked
                  ? [colors.bg, colors.border, colors.glow, "hover:scale-105"]
                  : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] opacity-50"
              )}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-3",
                    badge.unlocked ? colors.bg : "bg-[rgba(255,255,255,0.05)]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      badge.unlocked ? colors.text : "text-muted-foreground"
                    )}
                  />
                </div>
                <h3
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider mb-1",
                    badge.unlocked ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {badge.name}
                </h3>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {badge.description}
                </p>

                {!badge.unlocked && badge.progress && (
                  <div className="w-full mt-3">
                    <div className="h-1 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {badge.progress}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
