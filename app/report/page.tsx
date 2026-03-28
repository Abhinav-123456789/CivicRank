"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { User } from "firebase/auth"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { categorizeIssue, detectPriority } from "@/lib/smartGovernance"
import { detectDuplicate, mergeDuplicateReport } from "@/lib/issueService"
import { MapPin, AlertCircle, ChevronRight, GitMerge } from "lucide-react"
import Link from "next/link"
import { ProfileDropdown } from "@/components/ui/profile-dropdown"

export default function ReportPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [error, setError] = useState("")
  
  const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<"fetching" | "success" | "error">("fetching")

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/login")
      } else {
        setUser(currentUser)
      }
    })

    // Geolocation with 10-second timeout to prevent permanent button lock
    const geoTimeout = setTimeout(() => {
      if (locationStatus === "fetching") {
        setLocationStatus("error")
      }
    }, 10000)

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(geoTimeout)
          setLocationCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationStatus("success")
        },
        (error) => {
          clearTimeout(geoTimeout)
          console.warn("Location error:", error)
          setLocationCoords(null)
          setLocationStatus("error")
        },
        { timeout: 9000, maximumAge: 300000 }
      )
    } else {
      clearTimeout(geoTimeout)
      setLocationCoords(null)
      setLocationStatus("error")
    }

    return () => {
      unsubscribe()
      clearTimeout(geoTimeout)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    if (!user) {
      setError("You must be logged in")
      setLoading(false)
      return
    }

    if (!locationCoords && locationStatus === "fetching") {
      setError("Still fetching location. Please wait a moment and try again.")
      setLoading(false)
      return
    }

    // Use default fallback coords (India center) if GPS unavailable
    const finalCoords = locationCoords || { lat: 20.5937, lng: 78.9629 }

    try {
      const fullText = `${title} ${description}`
      const aiCategory = categorizeIssue(fullText)
      const aiPriority = detectPriority(fullText)

      // ── Duplicate detection ─────────────────────────────────────────────
      const duplicate = await detectDuplicate(aiCategory, finalCoords)

      if (duplicate) {
        // Merge into existing issue instead of creating a new one
        await mergeDuplicateReport(duplicate.id, user.uid)
        setIsDuplicate(true)
        setSuccess(true)
        setTitle("")
        setDescription("")
        await router.push("/community")
        return
      }
      // ── New unique issue ────────────────────────────────────────────────

      const docRef = await addDoc(collection(db, "issues"), {
        title,
        description,
        location: finalCoords,
        coords: finalCoords,
        category: aiCategory,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        priorityLevel: aiPriority,
        status: "open",
        upvotes: 0,
        isVerified: false,
        upvotedBy: [],
        verifications: 0,
        reportCount: 1,
        reporters: [user.uid],
      })

      setSuccess(true)
      setTitle("")
      setDescription("")
      
      await router.push("/community")
    } catch (err: any) {
      setError(err.message || "Failed to report issue")
      console.error("Error adding document: ", err)
      setLoading(false)
    }
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
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/community" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-500 flex items-center justify-center glow-cyan">
              <MapPin className="w-5 h-5 text-[#0a0a0a]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Civic<span className="text-neon-cyan">Rank</span>
            </span>
          </Link>
          <ProfileDropdown />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto p-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground mb-4">
            Report an Issue
          </h1>
          <p className="text-muted-foreground">Help improve your city by reporting issues in your area</p>
        </div>

        {/* Form Card */}
        <div className="relative p-8 rounded-2xl glass-card-strong border border-neon-cyan/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[80px] opacity-50" />

          <form onSubmit={handleSubmit} className="relative space-y-6">
            {/* Success Message */}
            {success && (
              <div className={`p-4 rounded-lg border text-sm flex items-center gap-2 ${
                isDuplicate
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-green-500/10 border-green-500/30 text-green-400"
              }`}>
                {isDuplicate ? (
                  <GitMerge className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                {isDuplicate
                  ? "Similar issue nearby already exists — your report has been merged to boost its priority!"
                  : "Issue reported successfully! Redirecting..."}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Title Input */}
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-foreground block mb-2">
                Issue Title
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title of the issue"
                  required
                  disabled={loading}
                  maxLength={100}
                  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(0,212,255,0.2)] rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{title.length}/100</p>
            </div>

            {/* Description Input */}
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-foreground block mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information about the issue"
                required
                disabled={loading}
                maxLength={500}
                rows={5}
                className="w-full px-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(0,212,255,0.2)] rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{description.length}/500</p>
              <p className="text-xs text-neon-cyan/70 mt-3 font-medium">
                💡 Category and priority will be detected automatically using AI.
              </p>
              
              <div className="mt-4 p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(0,212,255,0.2)]">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neon-cyan" />
                  Your Location
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {locationStatus === "fetching"
                    ? "📡 Fetching GPS location..."
                    : locationStatus === "error"
                      ? "⚠️ GPS unavailable — default coordinates will be used"
                      : `✅ GPS: ${locationCoords?.lat.toFixed(4)}, ${locationCoords?.lng.toFixed(4)}`}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || locationStatus === "fetching"}
              className="w-full group mt-8 relative px-8 py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-blue-500 text-[#0a0a0a] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="flex items-center justify-center gap-2">
                {locationStatus === "fetching" ? "Waiting for GPS..." : loading ? "Reporting..." : "Submit Report"}
                {(locationStatus !== "fetching" && !loading) && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
