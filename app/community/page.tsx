"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getUserRole, getPriorityScore, isIssueVerified, Issue } from "@/lib/issues"
import { subscribeToIssues, upvoteIssueForUser } from "@/lib/issueService"
import { 
  MapPin, 
  ThumbsUp, 
  AlertCircle, 
  ChevronRight, 
  Menu, 
  X, 
  BadgeCheck,
  Zap,
  ChevronDown,
  UserCircle,
  Activity,
  LogOut,
  LayoutDashboard,
  User as UserIcon
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function CommunityPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  // upvotingIds: tracks issues currently being upvoted (shows loading state)
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Dropdown States
  const [showXP, setShowXP] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  
  const xpRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Hardcoded location for now (will be replaced with GPS/AI detection)
  const userLocation = "Jalandhar"

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (xpRef.current && !xpRef.current.contains(e.target as Node)) {
        setShowXP(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await signOut(auth);
      console.log("Logged out");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null
    let unsubscribeIssues: (() => void) | null = null

    const checkAuth = async () => {
      unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
        if (!currentUser) {
          router.push("/login")
          return
        }

        setUser(currentUser)
        const role = await getUserRole(currentUser.uid)
        setIsAdmin(role === "admin")
        
        // Subscribe to all issues in real-time from Firestore
        unsubscribeIssues = subscribeToIssues((fetchedIssues) => {
          // Filter by location (string match; GPS issues pass through)
          const filteredByLocation = fetchedIssues.filter(issue => {
            if (typeof issue.location === 'string') {
              return issue.location.toLowerCase().includes(userLocation.toLowerCase())
            }
            return true
          })
          
          setIssues(filteredByLocation as Issue[])
          setLoading(false)
        })
      })
    }

    checkAuth()

    return () => {
      unsubscribeAuth?.()
      unsubscribeIssues?.()
    }
  }, [router])

  const getPriorityColor = (upvotes: number) => {
    if (upvotes > 10) {
      return "bg-red-500/20 border-red-500/30 text-red-400"
    } else if (upvotes >= 5) {
      return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
    } else {
      return "bg-green-500/20 border-green-500/30 text-green-400"
    }
  }

  const getPriorityLabel = (upvotes: number) => {
    if (upvotes > 10) return "High"
    if (upvotes >= 5) return "Medium"
    return "Low"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500/10 text-green-400 border-green-500/30"
      case "in-progress":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-red-500/10 text-red-400 border-red-500/30"
    }
  }

  const getIssueHighlightStyle = (issueId: string) => {
    const index = issues.findIndex((i) => i.id === issueId)
    if (index === 0) {
      // Top issue - red accent with intense glow
      return "border-red-500/60 shadow-lg shadow-red-500/20 bg-red-500/5"
    } else if (index < 3) {
      // Top 3 - glow border
      return "border-neon-cyan/50 shadow-lg shadow-neon-cyan/20"
    }
    return ""
  }

  // Has the current user already voted on this issue?
  const hasVoted = (issue: Issue): boolean => {
    if (!user) return false;
    // Prefer server-authoritative upvotedBy array
    if (Array.isArray(issue.upvotedBy)) return issue.upvotedBy.includes(user.uid);
    // Legacy fallback — won't persist across sessions, but safe
    return upvotingIds.has(issue.id);
  };

  const handleUpvote = async (issueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || upvotingIds.has(issueId)) return;
    const issue = issues.find(i => i.id === issueId);
    if (!issue || hasVoted(issue)) return;

    // Mark as in-flight
    setUpvotingIds(prev => new Set(prev).add(issueId));

    // Optimistic local update so UI reacts instantly
    setIssues(prev =>
      prev.map(i =>
        i.id === issueId
          ? {
              ...i,
              upvotes: i.upvotes + 1,
              upvotedBy: [...(i.upvotedBy ?? []), user.uid],
              isVerified: (i.upvotes + 1) >= 3,
            }
          : i
      )
    );

    try {
      const result = await upvoteIssueForUser(issueId, user.uid);
      if (result === 'already_voted') {
        // Roll back optimistic update — server says they already voted
        setIssues(prev =>
          prev.map(i =>
            i.id === issueId
              ? { ...i, upvotes: i.upvotes - 1, upvotedBy: (i.upvotedBy ?? []).filter(id => id !== user.uid) }
              : i
          )
        );
      }
    } catch (err) {
      // Roll back on error
      setIssues(prev =>
        prev.map(i =>
          i.id === issueId
            ? { ...i, upvotes: i.upvotes - 1, upvotedBy: (i.upvotedBy ?? []).filter(id => id !== user.uid) }
            : i
        )
      );
    } finally {
      setUpvotingIds(prev => { const s = new Set(prev); s.delete(issueId); return s; });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] cyber-grid">
      {/* Ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-cyan/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-purple/12 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-[50] p-4 sm:p-6 border-b border-neon-cyan/20">
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

          {/* Desktop Right Side - XP & Profile Dropdowns */}
          <div className="hidden sm:flex items-center gap-4">
            {user && (
              <>
                {/* XP Button & Dropdown */}
                <div className="relative" ref={xpRef}>
                  <button
                    onClick={() => {
                      setShowXP(!showXP)
                      setShowProfile(false)
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
                      "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]",
                      showXP ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-105" : "hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:scale-105"
                    )}
                  >
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-sm text-amber-400 tracking-wide">7,850 XP</span>
                    <ChevronDown className={cn("w-3 h-3 text-amber-400 transition-transform duration-300", showXP && "rotate-180")} />
                  </button>

                  {/* XP Dropdown */}
                  <div className={cn(
                    "absolute top-full right-0 mt-3 w-56 bg-[#0b0f1a]/95 backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden",
                    "transition-all duration-200 ease-out origin-top-right",
                    showXP ? "opacity-100 translate-y-0 pointer-events-auto scale-100" : "opacity-0 translate-y-2 pointer-events-none scale-95"
                  )}>
                    <div className="p-4 border-b border-[rgba(255,255,255,0.05)]">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Level</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Lv. 12</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/20">Veteran</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Total XP</span>
                        <span className="font-bold text-foreground">7,850</span>
                      </div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Next Level</span>
                        <span className="font-bold text-foreground">10,000</span>
                      </div>
                      <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-1.5 mt-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-1.5 rounded-full" style={{ width: '78.5%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Profile & Dropdown */}
                <div className="relative pl-4 border-l border-[rgba(255,255,255,0.1)]" ref={profileRef}>
                  <button 
                    onClick={() => {
                      setShowProfile(!showProfile)
                      setShowXP(false)
                    }}
                    className={cn(
                      "flex items-center gap-3 group transition-all duration-300 rounded-lg p-1",
                      showProfile ? "bg-[rgba(255,255,255,0.05)]" : "hover:bg-[rgba(255,255,255,0.03)]"
                    )}
                  >
                    <div className="relative">
                      <div className={cn(
                        "w-10 h-10 rounded-full p-[2px] transition-all duration-300",
                        showProfile ? "bg-gradient-to-br from-neon-purple to-neon-cyan shadow-[0_0_15px_rgba(0,212,255,0.3)] scale-105" : "bg-gradient-to-br from-neon-cyan to-neon-purple group-hover:shadow-[0_0_12px_rgba(0,212,255,0.2)] group-hover:scale-105"
                      )}>
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-foreground" />
                          )}
                        </div>
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                    </div>
                    
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", showProfile && "rotate-180")} />
                  </button>

                  {/* Profile Dropdown */}
                  <div className={cn(
                    "absolute top-full right-0 mt-3 w-48 bg-[#0b0f1a]/95 backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden",
                    "transition-all duration-200 ease-out origin-top-right flex flex-col",
                    showProfile ? "opacity-100 translate-y-0 pointer-events-auto scale-100" : "opacity-0 translate-y-2 pointer-events-none scale-95"
                  )}>
                    <div className="p-3 border-b border-[rgba(255,255,255,0.05)]">
                      <p className="text-sm font-bold text-foreground truncate">{user.displayName || "Citizen"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5 flex flex-col">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(isAdmin ? '/admin' : '/dashboard')
                        }} 
                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors w-full text-left"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {isAdmin ? 'Admin Panel' : 'Dashboard'}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors w-full text-left"
                      >
                        <Activity className="w-4 h-4" />
                        My Activity
                      </button>
                    </div>
                    <div className="p-1.5 border-t border-[rgba(255,255,255,0.05)]">
                      <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] flex flex-col gap-2">
            <Link href="/report" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 rounded-lg border border-neon-cyan/30 text-foreground text-sm font-bold text-center transition-colors hover:border-neon-cyan/60">Report Issue</Link>
            <Link href="/community" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-bold text-center">Community</Link>
            <Link href="/map" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 rounded-lg border border-neon-cyan/30 text-foreground text-sm font-bold text-center transition-colors hover:border-neon-cyan/60">Map</Link>
            <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 rounded-lg border border-neon-cyan/30 text-foreground text-sm font-bold text-center transition-colors hover:border-neon-cyan/60">Leaderboard</Link>
            {isAdmin && <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 rounded-lg border border-neon-purple/30 text-neon-purple text-sm font-bold text-center transition-colors hover:border-neon-purple/60">Admin Panel</Link>}
            <button onClick={handleLogout} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-center">Logout</button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="relative z-10 px-4 sm:px-6 py-3 border-b border-neon-cyan/10 bg-[rgba(0,212,255,0.02)] hidden sm:block">
        <div className="max-w-6xl mx-auto flex gap-3 flex-wrap">
          <Link href="/report" className="px-4 py-2 rounded-lg border border-neon-cyan/30 text-foreground hover:border-neon-cyan/60 text-sm font-bold transition-colors hover-pop">Report Issue</Link>
          <Link href="/community" className="px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-bold hover-pop">Community</Link>
          <Link href="/map" className="px-4 py-2 rounded-lg border border-neon-cyan/30 text-foreground hover:border-neon-cyan/60 text-sm font-bold transition-colors hover-pop">Map</Link>
          <Link href="/leaderboard" className="px-4 py-2 rounded-lg border border-neon-cyan/30 text-foreground hover:border-neon-cyan/60 text-sm font-bold transition-colors hover-pop">Leaderboard</Link>
          {isAdmin && (
            <Link href="/admin" className="px-4 py-2 rounded-lg border border-neon-purple/30 text-neon-purple hover:border-neon-purple/60 text-sm font-bold transition-colors hover-pop">Admin Panel</Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground mb-2">
            Community Feed
          </h1>
          <p className="text-muted-foreground">
            Showing issues near you 📍 in {userLocation}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Issues List */}
        {loading ? (
          <div className="grid gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="relative p-6 rounded-xl glass-card-strong border border-neon-cyan/10 overflow-hidden animate-pulse">
                <div className="h-6 w-2/3 bg-[rgba(255,255,255,0.05)] rounded mb-3" />
                <div className="h-4 w-full bg-[rgba(255,255,255,0.03)] rounded mb-2" />
                <div className="h-4 w-4/5 bg-[rgba(255,255,255,0.03)] rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-neon-cyan/10 rounded-full" />
                  <div className="h-6 w-24 bg-neon-cyan/10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12 p-8 rounded-xl glass-card-strong border border-neon-cyan/20">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neon-cyan" />
            <p className="text-foreground font-bold mb-2">No issues in your area 📍</p>
            <p className="text-muted-foreground mb-6">Be the first to report an issue and help improve your city!</p>
            <Link
              href="/report"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-blue-500 text-[#0a0a0a] font-bold uppercase tracking-wider text-sm glow-cyan-intense hover:scale-105 transition-all"
            >
              Report Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {issues.map((issue, index) => (
              <div
                key={issue.id}
                onClick={() => router.push(`/issue/${issue.id}`)}
                className={`relative p-6 rounded-xl glass-card-strong border overflow-hidden group transition-all cursor-pointer hover-premium ${
                  getIssueHighlightStyle(issue.id) || "border-neon-cyan/20 hover:border-neon-cyan/40"
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-sm font-bold whitespace-nowrap ${getStatusColor(issue.status)}`}>
                      {issue.status === "resolved" ? "✓ Resolved" : issue.status === "in-progress" ? "► In Progress" : "Reported"}
                    </div>
                  </div>

                  {/* Badges and Labels */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {index === 0 && (
                      <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 uppercase font-bold flex items-center gap-1">
                        🔥 Top Priority
                      </span>
                    )}
                    <span className="text-xs px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan uppercase font-bold">
                      {issue.category}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full border font-bold uppercase ${getPriorityColor(issue.upvotes)}`}>
                      {getPriorityLabel(issue.upvotes)} Priority
                    </span>
                    {/* Verification Badge */}
                    {isIssueVerified(issue) ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-500/20 border border-green-500/30 text-green-400 font-bold">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold">
                        ⏳ Not Verified
                      </span>
                    )}
                    <span className="text-xs px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple font-bold">
                      Score: {getPriorityScore(issue)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-6 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Location:</span>{" "}
                      <span className="text-foreground font-bold">
                        {typeof issue.location === 'string'
                          ? issue.location
                          : issue.coords?.lat
                            ? `${issue.coords.lat.toFixed(3)}, ${issue.coords.lng.toFixed(3)}`
                            : typeof issue.location === 'object' && issue.location?.lat
                              ? `${issue.location.lat.toFixed(3)}, ${issue.location.lng.toFixed(3)}`
                              : 'Nearby'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>{" "}
                      <span className="text-foreground">
                        {issue.createdAt instanceof Date
                          ? issue.createdAt.toLocaleDateString()
                          : new Date((issue.createdAt as any)?.toMillis?.() || 0).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-foreground font-bold">
                      Upvotes: <span className="text-neon-cyan">{issue.upvotes}</span>
                    </div>
                    <button
                      onClick={(e) => handleUpvote(issue.id, e)}
                      disabled={hasVoted(issue) || upvotingIds.has(issue.id)}
                      className={`group px-4 py-2 rounded-lg border flex items-center gap-2 font-bold text-sm transition-all ${
                        hasVoted(issue)
                          ? "bg-neon-cyan/20 border-neon-cyan/60 text-neon-cyan opacity-70 cursor-not-allowed"
                          : upvotingIds.has(issue.id)
                            ? "opacity-50 cursor-wait"
                            : "border-neon-cyan/30 text-foreground hover:border-neon-cyan/60 hover:text-neon-cyan hover-pop"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {hasVoted(issue) ? "Upvoted ✓" : upvotingIds.has(issue.id) ? "Voting..." : "Upvote"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
