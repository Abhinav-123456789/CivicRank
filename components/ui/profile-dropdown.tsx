"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { ChevronDown, User as UserIcon, LayoutDashboard, Activity, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProfileDropdown() {
  const router = useRouter()
  const { user, role } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  if (!user) return null;

  return (
    <div className="relative pl-4 border-l border-[rgba(255,255,255,0.1)] shrink-0" ref={profileRef}>
      <button 
        onClick={() => setShowProfile(!showProfile)}
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

      {/* Dropdown Menu */}
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
  )
}
