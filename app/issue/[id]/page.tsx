"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { User, signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { getIssueById, getUserRole, upvoteIssue, Issue } from "@/lib/issues"
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"
import { MapPin, ThumbsUp, AlertCircle, ChevronLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { ProfileDropdown } from "@/components/ui/profile-dropdown"

export default function IssueDetailPage() {
  const router = useRouter()
  const params = useParams()
  const issueId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [upvoting, setUpvoting] = useState(false)

  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null

    const setupAndFetchIssue = async (currentUser: User | null) => {
      if (!currentUser) {
        router.push("/login")
        return
      }

      if (!issueId) {
        setLoading(false)
        return
      }

      setUser(currentUser)
      const role = await getUserRole(currentUser.uid)
      setIsAdmin(role === "admin")

      // Fetch the single issue using Firestore
      try {
        setLoading(true)
        setError("")
        console.log("[IssueDetail] Fetching issue with ID:", issueId)

        const docRef = doc(db, "issues", issueId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const issueData = { id: docSnap.id, ...docSnap.data() }
          console.log("[IssueDetail] Issue found:", issueData)
          setIssue(issueData as unknown as Issue)
        } else {
          console.warn("[IssueDetail] Issue document does not exist for ID:", issueId)
          setIssue(null)
          setError(`Issue with ID "${issueId}" not found in database`)
        }
      } catch (err) {
        console.error("[IssueDetail] Error fetching issue:", err)
        setError("Failed to load issue details")
        setIssue(null)
      } finally {
        setLoading(false)
      }
    }

    unsubscribeAuth = auth.onAuthStateChanged(setupAndFetchIssue)

    return () => {
      unsubscribeAuth?.()
    }
  }, [issueId, router])

  const handleUpvote = async () => {
    if (hasUpvoted || !issue) return

    setUpvoting(true)
    try {
      await upvoteIssue(issueId)

      // Update local state
      setIssue({ ...issue, upvotes: issue.upvotes + 1 })
      setHasUpvoted(true)
    } catch (err) {
      console.error("Failed to upvote:", err)
    } finally {
      setUpvoting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500/20 border-green-500/30 text-green-400"
      case "in-progress":
        return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
      default:
        return "bg-red-500/20 border-red-500/30 text-red-400"
    }
  }

  const getPriorityColor = (upvotes: number) => {
    if (upvotes > 10) {
      return "text-red-400"
    } else if (upvotes >= 5) {
      return "text-yellow-400"
    } else {
      return "text-green-400"
    }
  }

  const getPriorityLabel = (upvotes: number) => {
    if (upvotes > 10) return "High"
    if (upvotes >= 5) return "Medium"
    return "Low"
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
      <div className="relative z-10 max-w-4xl mx-auto p-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 font-bold mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Community
        </button>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading issue details...</p>
          </div>
        ) : error || !issue ? (
          <div className="text-center py-12 p-8 rounded-xl glass-card-strong border border-red-500/20">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-foreground font-bold">{error || "Issue not found"}</p>
          </div>
        ) : (
          <div className="relative p-8 rounded-2xl glass-card-strong border border-neon-cyan/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[80px] opacity-50" />

            <div className="relative space-y-6">
              {/* Title and Status */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-black text-foreground mb-3">{issue.title}</h1>
                  <div className={`inline-block px-4 py-2 rounded-lg border text-sm font-bold ${getStatusColor(issue.status)}`}>
                    {issue.status === "resolved" ? "✓ Resolved" : issue.status === "in-progress" ? "► In Progress" : "● Reported"}
                  </div>
                </div>
              </div>

              {/* Category and Priority */}
              <div className="flex flex-wrap gap-3">
                <span className="text-sm px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan uppercase font-bold">
                  {issue.category}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full border font-bold uppercase bg-nuted-foreground/5 ${getPriorityColor(issue.upvotes)}`}>
                  {getPriorityLabel(issue.upvotes)} Priority
                </span>
              </div>

              {/* Image */}
              {issue.imageUrl && (
                <div className="my-6">
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-96 object-cover rounded-lg border border-neon-cyan/30"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">Description</h2>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{issue.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-t border-neon-cyan/10">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Location</p>
                  <p className="text-foreground font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neon-cyan" />
                    {typeof issue.location === 'string' 
                      ? issue.location 
                      : `${issue.location?.lat?.toFixed(4) || 0}, ${issue.location?.lng?.toFixed(4) || 0}`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Reported</p>
                  <p className="text-foreground font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neon-cyan" />
                    {issue.createdAt instanceof Date
                      ? issue.createdAt.toLocaleDateString()
                      : new Date((issue.createdAt as any)?.toMillis?.() || 0).toLocaleDateString()}
                  </p>
                </div>
                {issue.cluster && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Area</p>
                    <p className="text-foreground font-bold">{issue.cluster}</p>
                  </div>
                )}
              </div>

              {/* Upvotes and Action */}
              <div className="flex items-center justify-between pt-6 border-t border-neon-cyan/10">
                <div className="text-foreground font-bold text-lg">
                  Upvotes: <span className="text-neon-cyan text-2xl">{issue.upvotes}</span>
                </div>
                <button
                  onClick={handleUpvote}
                  disabled={hasUpvoted || upvoting}
                  className={`px-6 py-3 rounded-lg border flex items-center gap-2 font-bold transition-all ${
                    hasUpvoted
                      ? "bg-neon-cyan/20 border-neon-cyan/60 text-neon-cyan"
                      : "border-neon-cyan/30 text-foreground hover:border-neon-cyan/60 hover:text-neon-cyan disabled:opacity-50"
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  {hasUpvoted ? "Upvoted" : "Upvote"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
