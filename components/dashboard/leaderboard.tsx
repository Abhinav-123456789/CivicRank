import { cn } from "@/lib/utils"
import { Crown, TrendingUp, TrendingDown, Minus } from "lucide-react"

const contributors = [
  { rank: 1, name: "CivicHero", score: 12450, change: "up", avatar: "CH" },
  { rank: 2, name: "UrbanWatch", score: 11200, change: "up", avatar: "UW" },
  { rank: 3, name: "CityGuard", score: 10100, change: "down", avatar: "CG" },
  { rank: 4, name: "You", score: 8650, change: "up", avatar: "YU", isUser: true },
  { rank: 5, name: "LocalVoice", score: 7300, change: "none", avatar: "LV" },
]

export function Leaderboard() {
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
          TOP CITY CONTRIBUTORS
        </h2>
        <span className="text-xs text-neon-purple">This Month</span>
      </div>

      <div className="space-y-3">
        {contributors.map((contributor) => (
          <div
            key={contributor.rank}
            className={cn(
              "flex items-center gap-4 p-3 rounded-lg transition-all duration-300",
              contributor.isUser
                ? "bg-neon-cyan/10 border border-neon-cyan/20 glow-border-cyan"
                : "bg-[rgba(255,255,255,0.02)] border border-transparent hover:bg-[rgba(255,255,255,0.05)]"
            )}
          >
            {/* Rank */}
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                contributor.rank === 1 && "bg-amber-500/20 text-amber-400",
                contributor.rank === 2 && "bg-zinc-400/20 text-zinc-300",
                contributor.rank === 3 && "bg-amber-700/20 text-amber-600",
                contributor.rank > 3 && "bg-[rgba(255,255,255,0.05)] text-muted-foreground"
              )}
            >
              {contributor.rank === 1 ? (
                <Crown className="w-4 h-4" />
              ) : (
                `#${contributor.rank}`
              )}
            </div>

            {/* Avatar */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                contributor.isUser
                  ? "bg-gradient-to-br from-neon-cyan to-neon-purple text-background"
                  : "bg-[rgba(255,255,255,0.1)] text-foreground"
              )}
            >
              {contributor.avatar}
            </div>

            {/* Name */}
            <div className="flex-1">
              <p
                className={cn(
                  "font-semibold text-sm",
                  contributor.isUser ? "text-neon-cyan" : "text-foreground"
                )}
              >
                {contributor.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {contributor.score.toLocaleString()} civic pts
              </p>
            </div>

            {/* Change indicator */}
            <div
              className={cn(
                "w-6 h-6 rounded flex items-center justify-center",
                contributor.change === "up" && "text-emerald-400",
                contributor.change === "down" && "text-red-400",
                contributor.change === "none" && "text-muted-foreground"
              )}
            >
              {contributor.change === "up" && <TrendingUp className="w-4 h-4" />}
              {contributor.change === "down" && <TrendingDown className="w-4 h-4" />}
              {contributor.change === "none" && <Minus className="w-4 h-4" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
