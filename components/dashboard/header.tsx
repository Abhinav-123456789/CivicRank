"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Bell, Plus, Search, Settings, User, MapPin, Zap, ChevronDown, UserCircle, Activity, LogOut } from "lucide-react"

export function Header() {
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

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  return (
    <header className="flex items-center justify-between py-6 relative z-50">
      
      {/* 🔥 NEW LOGO */}
      <div className="flex items-center gap-3">
        
        {/* Icon */}
        <div className="relative w-11 h-11 rounded-xl 
                        bg-gradient-to-br from-neon-cyan to-neon-purple 
                        flex items-center justify-center 
                        shadow-[0_0_12px_rgba(0,212,255,0.2)]
                        hover:scale-105 transition-all duration-300 cursor-pointer">

          {/* Location pin */}
          <MapPin className="text-white w-4 h-4 absolute top-1.5" />

          {/* Ranking bars */}
          <div className="flex gap-[2px] absolute bottom-1.5">
            <div className="w-[2px] h-2 bg-white rounded"></div>
            <div className="w-[2px] h-3 bg-white rounded"></div>
            <div className="w-[2px] h-2 bg-white rounded"></div>
          </div>
        </div>

        {/* Text */}
        <div>
          <h1 className="text-xl font-bold tracking-wide">
            <span className="text-gray-200">Civic</span>
            <span className="text-neon-cyan">Rank</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Smart City Platform
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] w-80">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search issues, locations..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 focus:ring-0"
        />
        <kbd className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-[rgba(255,255,255,0.05)] rounded">
          /
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        
        {/* Add Issue */}
        <button
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300",
            "bg-gradient-to-r from-neon-cyan to-neon-purple",
            "hover:shadow-[0_0_15px_rgba(0,212,255,0.35)] hover:scale-[1.03]",
            "text-background font-semibold text-sm"
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Report Issue</span>
        </button>

        {/* Notification */}
        <button
          className={cn(
            "relative p-2.5 rounded-lg transition-all duration-300",
            "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]",
            "hover:bg-neon-cyan/10 hover:border-neon-cyan/30"
          )}
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
        </button>

        {/* Settings */}
        <button
          className={cn(
            "p-2.5 rounded-lg transition-all duration-300",
            "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]",
            "hover:bg-neon-purple/10 hover:border-neon-purple/30"
          )}
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* XP Button & Dropdown */}
        <div className="relative ml-2" ref={xpRef}>
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
        <div className="relative ml-2 pl-4 border-l border-[rgba(255,255,255,0.1)]" ref={profileRef}>
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
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-foreground group-hover:text-neon-cyan transition-colors">CitizenOne</p>
              <p className="text-[10px] text-neon-cyan uppercase tracking-wider">Active</p>
            </div>

            <div className="relative">
              <div className={cn(
                "w-10 h-10 rounded-full p-[2px] transition-all duration-300",
                showProfile ? "bg-gradient-to-br from-neon-purple to-neon-cyan shadow-[0_0_15px_rgba(0,212,255,0.3)] scale-105" : "bg-gradient-to-br from-neon-cyan to-neon-purple group-hover:shadow-[0_0_12px_rgba(0,212,255,0.2)] group-hover:scale-105"
              )}>
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <User className="w-5 h-5 text-foreground" />
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
              <p className="text-sm font-bold text-foreground">CitizenOne</p>
              <p className="text-xs text-muted-foreground truncate">citizen@civicrank.com</p>
            </div>
            <div className="p-1.5 flex flex-col">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors w-full text-left">
                <UserCircle className="w-4 h-4" />
                View Profile
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors w-full text-left">
                <Activity className="w-4 h-4" />
                My Activity
              </button>
            </div>
            <div className="p-1.5 border-t border-[rgba(255,255,255,0.05)]">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}