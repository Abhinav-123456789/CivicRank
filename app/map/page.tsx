"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { MapPin, ArrowLeft } from "lucide-react"

// Dynamically import MapClient without SSR
const MapClient = dynamic(() => import("@/components/map/MapClient"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#0a0a0a]">
      <div className="w-12 h-12 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin mb-4"></div>
      <p className="text-neon-cyan font-bold uppercase tracking-widest text-sm animate-pulse">Initializing Map...</p>
    </div>
  )
})

export default function MapPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(10,10,10,0.8)] backdrop-blur-xl shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-500 flex items-center justify-center glow-cyan">
                  <MapPin className="w-5 h-5 text-[#0a0a0a]" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">
                Civic<span className="text-neon-cyan">Rank</span>
              </span>
            </Link>

            {/* Title / Back Button */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] text-sm font-bold text-foreground transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline-block">Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Map Content - Fills remaining height */}
      <main className="flex-1 w-full relative z-10">
        <MapClient />
      </main>
    </div>
  )
}
