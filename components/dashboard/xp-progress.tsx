import { cn } from "@/lib/utils"
import { Award } from "lucide-react"

interface CivicProgressProps {
  currentScore: number
  maxScore: number
  rank: number
}

export function CivicProgress({ currentScore, maxScore, rank }: CivicProgressProps) {
  const percentage = (currentScore / maxScore) * 100

  const getRankTitle = (rank: number) => {
    if (rank >= 50) return "City Champion"
    if (rank >= 40) return "Community Leader"
    if (rank >= 30) return "Active Citizen"
    if (rank >= 20) return "Engaged Resident"
    if (rank >= 10) return "Rising Contributor"
    return "New Citizen"
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6",
        "bg-[rgba(15,15,20,0.6)] backdrop-blur-xl",
        "border border-[rgba(255,255,255,0.08)]"
      )}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple p-[2px]">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <span className="text-lg font-bold text-neon-cyan">{rank}</span>
                </div>
              </div>
              <div className="absolute -inset-1 rounded-full bg-neon-cyan/20 blur-md -z-10" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                CITIZEN RANK
              </h3>
              <p className="text-xl font-bold text-foreground">{getRankTitle(rank)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
            <Award className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-bold text-neon-cyan">
              {currentScore.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="h-3 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan relative transition-all duration-500"
              style={{ width: `${percentage}%` }}
            >
              {/* Animated shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>
          {/* Glow under progress */}
          <div
            className="absolute top-0 left-0 h-3 rounded-full blur-md bg-gradient-to-r from-neon-cyan to-neon-purple opacity-50 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>{currentScore.toLocaleString()} Civic Score</span>
          <span>{maxScore.toLocaleString()} pts to Rank {rank + 1}</span>
        </div>
      </div>
    </div>
  )
}
