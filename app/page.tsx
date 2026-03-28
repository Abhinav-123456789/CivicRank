"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  MapPin, 
  Trophy, 
  LayoutDashboard, 
  Map, 
  User,
  Zap,
  CheckCircle,
  Users,
  TrendingUp,
  Brain,
  Activity,
  Shield,
  Star,
  Award,
  ChevronRight,
  ChevronDown,
  UserCircle,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

import { useAuth } from "@/hooks/useAuth"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"

export default function LandingPage() {
  const router = useRouter()
  const { user, role } = useAuth()
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)
  
  const [showXP, setShowXP] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  
  const xpRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] cyber-grid">
      {/* Enhanced ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-cyan/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-purple/12 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[200px]" />
        <div className="absolute top-1/4 right-1/3 w-[300px] h-[300px] bg-neon-purple/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(10,10,10,0.8)] backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-500 flex items-center justify-center glow-cyan">
                    <MapPin className="w-5 h-5 text-[#0a0a0a]" />
                  </div>
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  Civic<span className="text-neon-cyan">Rank</span>
                </span>
              </Link>

              {/* Center Navigation */}
              <div className="hidden md:flex items-center gap-10">
                <button
                  onClick={() => {
                    if (!user) router.push("/login")
                    else router.push("/dashboard")
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-neon-cyan transition-all duration-300 group border-b-2 border-transparent hover:border-neon-cyan/50 pb-0.5"
                >
                  <LayoutDashboard className="w-4 h-4 group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
                  <span className="uppercase tracking-wider">Dashboard</span>
                </button>
                <Link
                  href="/map"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-neon-cyan transition-all duration-300 group border-b-2 border-transparent hover:border-neon-cyan/50 pb-0.5"
                >
                  <Map className="w-4 h-4 group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
                  <span className="uppercase tracking-wider">Map</span>
                </Link>
                <Link
                  href="/leaderboard"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-neon-cyan transition-all duration-300 group border-b-2 border-transparent hover:border-neon-cyan/50 pb-0.5"
                >
                  <Trophy className="w-4 h-4 group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
                  <span className="uppercase tracking-wider">Leaderboard</span>
                </Link>
              </div>

              {/* Right Side - Profile & XP */}
              <div className="flex items-center gap-2 sm:gap-4">
                {user ? (
                  <>
                    {/* XP Button & Dropdown */}
                    <div className="relative" ref={xpRef}>
                      <button
                        onClick={() => {
                          setShowXP(!showXP)
                          setShowProfile(false)
                        }}
                        className={cn(
                          "hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
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
                    <div className="relative pl-2 sm:pl-4 border-l border-[rgba(255,255,255,0.1)]" ref={profileRef}>
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
                                <User className="w-5 h-5 text-foreground" />
                              )}
                            </div>
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                        </div>
                        
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300 hidden sm:block", showProfile && "rotate-180")} />
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
                              router.push(role === 'admin' ? '/admin' : '/dashboard')
                            }} 
                            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors w-full text-left"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            {role === 'admin' ? 'Admin Panel' : 'Dashboard'}
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
                ) : (
                  <button onClick={() => router.push("/login")} className="px-6 py-2.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-bold transition-all hover:bg-neon-cyan/20 hover:scale-105">
                    Log In
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-32 lg:py-40">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[1.1] text-balance">
                <span className="text-gray-100">Fix Your City,</span>
                <br />
                <span className="gradient-text text-glow-cyan">Rise Through Impact</span>
              </h1>
              
              <p className="mt-6 text-base sm:text-lg font-semibold tracking-widest uppercase text-neon-cyan/70">
                Report issues. Get them resolved. Earn impact.
              </p>

              <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
                Report issues, earn civic score, and transform your city through collective action.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
                <button onClick={() => router.push("/login")} className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-500 text-[#0a0a0a] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_25px_rgba(0,212,255,0.45)] hover:scale-105 transition-all duration-300">
                  <span className="flex items-center gap-2">
                    Start Reporting
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button onClick={() => router.push("/map")} className="px-8 py-4 rounded-xl glass-card-strong border border-neon-cyan/30 text-foreground font-bold uppercase tracking-wider text-sm hover:border-neon-cyan/60 hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:scale-[1.02] transition-all duration-300">
                  <span className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    View City Map
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Decorative line */}
          <div className="absolute bottom-0 left-0 right-0 neon-line-thick opacity-50" />
        </section>

        {/* Stats Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Issues Resolved */}
              <div className="group relative p-8 rounded-2xl glass-card-strong border border-neon-cyan/20 hover:border-neon-cyan/50 hover:glow-border-cyan transition-all duration-500">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 rounded-xl bg-neon-cyan/10">
                    <CheckCircle className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <div>
                    <p className="text-4xl lg:text-5xl font-black tracking-tight text-neon-cyan text-glow-cyan">
                      127,450+
                    </p>
                    <p className="mt-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                      ISSUES RESOLVED
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Citizens */}
              <div className="group relative p-8 rounded-2xl glass-card-strong border border-neon-purple/20 hover:border-neon-purple/50 hover:glow-border-purple transition-all duration-500">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 rounded-xl bg-neon-purple/10">
                    <Users className="w-8 h-8 text-neon-purple" />
                  </div>
                  <div>
                    <p className="text-4xl lg:text-5xl font-black tracking-tight text-neon-purple text-glow-purple">
                      48,200+
                    </p>
                    <p className="mt-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                      ACTIVE CITIZENS
                    </p>
                  </div>
                </div>
              </div>

              {/* City Impact Score */}
              <div className="group relative p-8 rounded-2xl glass-card-strong border border-neon-cyan/20 hover:border-neon-cyan/50 hover:glow-border-cyan transition-all duration-500">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 rounded-xl bg-neon-cyan/10">
                    <TrendingUp className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <div>
                    <p className="text-4xl lg:text-5xl font-black tracking-tight text-neon-cyan text-glow-cyan">
                      94.7%
                    </p>
                    <p className="mt-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                      CITY IMPACT SCORE
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
                Powerful <span className="gradient-text">Features</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Feature Card */}
              <button
                onClick={() => router.push("/dashboard")}
                className="group relative p-10 rounded-2xl glass-card-strong border border-neon-cyan/20 hover:border-neon-cyan/50 transition-all duration-500 hover:glow-border-cyan overflow-hidden cursor-pointer"
                onMouseEnter={() => setHoveredFeature("ai")}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-neon-cyan/10 glow-cyan">
                      <Brain className="w-8 h-8 text-neon-cyan" />
                    </div>
                    <h3 className="text-2xl font-bold uppercase tracking-wide text-foreground">
                      AI-Powered Issue Detection
                    </h3>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Automatically categorize and prioritize civic issues using intelligent analysis. Our AI system identifies patterns and routes reports to the right departments instantly.
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-neon-cyan font-medium">
                    <span className="uppercase tracking-wider text-sm">Learn More</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Heatmap Feature Card */}
              <button
                onClick={() => router.push("/map")}
                className="group relative p-10 rounded-2xl glass-card-strong border border-neon-purple/20 hover:border-neon-purple/50 transition-all duration-500 hover:glow-border-purple overflow-hidden cursor-pointer"
                onMouseEnter={() => setHoveredFeature("heatmap")}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-neon-purple/10 glow-purple">
                      <Activity className="w-8 h-8 text-neon-purple" />
                    </div>
                    <h3 className="text-2xl font-bold uppercase tracking-wide text-foreground">
                      Real-Time City Heatmap
                    </h3>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Visualize high-impact zones and track urban issues dynamically. See where your city needs attention most with our interactive visualization tools.
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-neon-purple font-medium">
                    <span className="uppercase tracking-wider text-sm">Explore Map</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Gamification Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="relative p-10 lg:p-16 rounded-3xl glass-card-strong border border-neon-cyan/20 overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px]" />
              </div>

              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left - Text Content */}
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-6">
                    <Zap className="w-4 h-4 text-neon-cyan" />
                    <span className="text-sm font-bold uppercase tracking-wider text-neon-cyan">Rewards System</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground leading-tight">
                    Earn Civic <span className="gradient-text text-glow-cyan">Rewards</span>
                  </h2>
                  <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                    Gain XP for reporting and verifying issues. Level up your civic standing and unlock exclusive badges as you contribute to your community.
                  </p>
                </div>

                {/* Right - Progress & Badges */}
                <div className="space-y-8">
                  {/* XP Progress */}
                  <div className="p-6 rounded-2xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-500 flex items-center justify-center text-xl font-black text-[#0a0a0a] glow-cyan">
                          42
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground uppercase tracking-wider">Current Rank</p>
                          <p className="text-lg font-bold text-foreground">City Champion</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider">Next Rank</p>
                        <p className="text-lg font-bold text-neon-purple">Urban Guardian</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative h-4 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-neon-cyan via-blue-500 to-neon-purple glow-cyan-intense"
                        style={{ width: "78.5%" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <span className="text-neon-cyan font-bold">7,850 XP</span>
                      <span className="text-muted-foreground">10,000 XP</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="group relative p-4 rounded-xl border bg-neon-cyan/10 border-neon-cyan/30 hover:glow-cyan transition-all duration-300 cursor-pointer">
                      <Shield className="w-6 h-6 text-neon-cyan" />
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <span className="text-xs font-medium text-muted-foreground">First Report</span>
                      </div>
                    </div>
                    <div className="group relative p-4 rounded-xl border bg-neon-purple/10 border-neon-purple/30 hover:glow-purple transition-all duration-300 cursor-pointer">
                      <Star className="w-6 h-6 text-neon-purple" />
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <span className="text-xs font-medium text-muted-foreground">Top Contributor</span>
                      </div>
                    </div>
                    <div className="group relative p-4 rounded-xl border bg-neon-cyan/10 border-neon-cyan/30 hover:glow-cyan transition-all duration-300 cursor-pointer">
                      <Award className="w-6 h-6 text-neon-cyan" />
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <span className="text-xs font-medium text-muted-foreground">Community Voice</span>
                      </div>
                    </div>
                    <div className="group relative p-4 rounded-xl border bg-neon-purple/10 border-neon-purple/30 hover:glow-purple transition-all duration-300 cursor-pointer">
                      <Trophy className="w-6 h-6 text-neon-purple" />
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <span className="text-xs font-medium text-muted-foreground">City Champion</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground">
              Ready to Make an <span className="gradient-text text-glow-cyan">Impact?</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Join thousands of citizens already transforming their communities.
            </p>
            <button onClick={() => router.push("/login")} className="mt-10 px-10 py-5 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-500 text-[#0a0a0a] font-bold uppercase tracking-wider text-sm glow-cyan-intense hover:scale-105 transition-all duration-300">
              Get Started Now
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-[rgba(255,255,255,0.05)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-blue-500 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#0a0a0a]" />
                </div>
                <span className="font-medium text-foreground">CivicRank</span>
              </div>
              <p>© 2026 CivicRank Smart City Platform. All rights reserved.</p>
              <div className="flex items-center gap-8">
                <Link href="#" className="hover:text-neon-cyan transition-colors">Terms</Link>
                <Link href="#" className="hover:text-neon-cyan transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-neon-cyan transition-colors">Support</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
