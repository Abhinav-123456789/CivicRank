"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getLeaderboard, getUserRole, LeaderboardEntry } from "@/lib/issues"
import { MapPin, Trophy, Award, Zap, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ProfileDropdown } from "@/components/ui/profile-dropdown"

export default function LeaderboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)
      const role = await getUserRole(currentUser.uid)
      setIsAdmin(role === "admin")
      loadLeaderboard()
    })

    return unsubscribe
  }, [router])

  const loadLeaderboard = async () => {
    try {
      setError("")
      const data = await getLeaderboard()
      setLeaderboard(data)
    } catch (err) {
      setError("Failed to load leaderboard")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) {
      return "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
    } else if (rank === 2) {
      return "bg-gray-400/20 border-gray-400/40 text-gray-300"
    } else if (rank === 3) {
      return "bg-orange-500/20 border-orange-500/40 text-orange-300"
    }
    return "bg-neon-purple/10 border-neon-purple/30 text-neon-purple"
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `${rank}`
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] cyber-grid">
      {/* Ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-cyan/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-purple/12 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-[50] p-6 border-b border-neon-cyan/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/community" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-500 flex items-center justify-center glow-cyan">
              <MapPin className="w-5 h-5 text-[#0a0a0a]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Civic<span className="text-neon-cyan">Rank</span>
              {isAdmin && <span className="text-xs text-neon-purple ml-2">ADMIN</span>}
            </span>
          </Link>
          <ProfileDropdown />
        </div>
      </div>

      <div className="relative z-10 p-6 border-b border-neon-cyan/10 bg-[rgba(0,212,255,0.02)]">
        <div className="max-w-6xl mx-auto flex gap-4">
          <Link href="/report" className="px-4 py-2 rounded-lg border border-neon-cyan/30 text-foreground hover:border-neon-cyan/60 text-sm font-bold transition-colors hover-pop">Report Issue</Link>
          <Link href="/community" className="px-4 py-2 rounded-lg border border-neon-cyan/30 text-foreground hover:border-neon-cyan/60 text-sm font-bold transition-colors hover-pop">Community</Link>
          <Link href="/leaderboard" className="px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-bold hover-pop">Leaderboard</Link>
          {isAdmin && (
            <Link href="/admin" className="px-4 py-2 rounded-lg border border-neon-purple/30 text-neon-purple hover:border-neon-purple/60 text-sm font-bold transition-colors hover-pop">Admin Panel</Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top contributors making a difference in your city
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 p-8 rounded-xl glass-card-strong border border-neon-cyan/20">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neon-cyan" />
            <p className="text-foreground font-bold mb-2">No contributors yet</p>
            <p className="text-muted-foreground mb-6">Be the first to report an issue!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.userId}
                className={`relative p-6 rounded-xl glass-card-strong border overflow-hidden group transition-all hover-premium ${
                  idx < 3
                    ? "border-neon-cyan/50 shadow-lg shadow-neon-cyan/20"
                    : "border-neon-cyan/20 hover:border-neon-cyan/40"
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex items-center justify-between gap-6">
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center border font-black text-2xl ${getRankBadgeStyle(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{entry.userName}</h3>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Issues Reported:</span>{" "}
                        <span className="text-foreground font-bold">{entry.totalIssues}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Upvotes:</span>{" "}
                        <span className="text-neon-cyan font-bold">{entry.totalUpvotes}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top 3 Badge */}
                  {entry.rank <= 3 && (
                    <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
                      <Zap className="w-5 h-5 text-neon-cyan" />
                      <span className="text-neon-cyan font-bold">Top {entry.rank}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && leaderboard.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl glass-card-strong border border-neon-cyan/20 hover-glow">
              <p className="text-muted-foreground text-sm mb-2">Total Contributors</p>
              <p className="text-3xl font-bold text-foreground">{leaderboard.length}</p>
            </div>
            <div className="p-6 rounded-xl glass-card-strong border border-neon-cyan/20">
              <p className="text-muted-foreground text-sm mb-2">Total Issues Reported</p>
              <p className="text-3xl font-bold text-neon-cyan">
                {leaderboard.reduce((sum, entry) => sum + entry.totalIssues, 0)}
              </p>
            </div>
            <div className="p-6 rounded-xl glass-card-strong border border-neon-cyan/20">
              <p className="text-muted-foreground text-sm mb-2">Total Community Upvotes</p>
              <p className="text-3xl font-bold text-neon-purple">
                {leaderboard.reduce((sum, entry) => sum + entry.totalUpvotes, 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
