"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { User, signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { getUserRole, isIssueVerified, Issue } from "@/lib/issues"
import { subscribeToIssues, deleteIssue, updateIssueStatus } from "@/lib/issueService"
import { clusterIssues, SEVERITY_COLORS } from "@/lib/clustering"
import { MapPin, Trash2, CheckCircle, Clock, Users, TrendingUp, Layers, BadgeCheck } from "lucide-react"
import Link from "next/link"
import { ProfileDropdown } from "@/components/ui/profile-dropdown"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "unverified">("all")

  const categories = [
    "All",
    "Infrastructure & Roads",
    "Water & Sanitation",
    "Waste Management",
    "Electricity & Utilities",
    "Community Issues"
  ]

  useEffect(() => {
    let unsubscribeIssues: (() => void) | null = null;
    let unsubscribeAuth: (() => void) | null = null;

    const checkAuth = async () => {
      unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
        if (!currentUser) {
          router.push("/login")
          return
        }

        // NOTE: This is UI-only. Security enforced via Firestore rules.
        const role = await getUserRole(currentUser.uid)
        if (role !== "admin") {
          router.push("/community")
          return
        }

        setUser(currentUser)
        unsubscribeIssues = subscribeToIssues((fetchedIssues) => {
          setIssues(fetchedIssues as Issue[])
          setLoading(false)
        })
      })
    }

    checkAuth()

    return () => {
      if (unsubscribeAuth) unsubscribeAuth()
      if (unsubscribeIssues) unsubscribeIssues()
    }
  }, [router])

  const handleStatusChange = async (issueId: string, newStatus: "open" | "in-progress" | "resolved") => {
    setUpdatingId(issueId)
    try {
      await updateIssueStatus(issueId, newStatus)
      setIssues(
        issues.map((issue) =>
          issue.id === issueId ? { ...issue, status: newStatus } : issue
        )
      )
    } catch (err) {
      setError("Failed to update issue status")
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteIssue = async (issueId: string) => {
    if (!confirm("Are you sure you want to delete this issue?")) return

    setUpdatingId(issueId)
    try {
      await deleteIssue(issueId)
      setIssues(issues.filter((issue) => issue.id !== issueId))
    } catch (err) {
      setError("Failed to delete issue")
      console.error(err)
    } finally {
      setUpdatingId(null)
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

  const getPriorityOrder = (priority: string) => {
    const order: { [key: string]: number } = {
      emergency: 4,
      high: 3,
      medium: 2,
      low: 1
    }
    return order[priority] || 0
  }

  const filteredIssues = issues.filter((issue) => {
    const catMatch = selectedCategory === "All" || issue.category === selectedCategory;
    const verMatch =
      verificationFilter === "all" ||
      (verificationFilter === "verified" && isIssueVerified(issue)) ||
      (verificationFilter === "unverified" && !isIssueVerified(issue));
    return catMatch && verMatch;
  });

  // Verified issues float to the top within their priority group
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    const pDiff = getPriorityOrder(b.priorityLevel) - getPriorityOrder(a.priorityLevel)
    if (pDiff !== 0) return pDiff
    // Verified before unverified
    return (isIssueVerified(b) ? 1 : 0) - (isIssueVerified(a) ? 1 : 0)
  })

  // ── Clustering for Zones panel ────────────────────────────────────────────
  const [showZones, setShowZones] = useState(true)
  const zones = useMemo(() => clusterIssues(issues as any), [issues])

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
              Civic<span className="text-neon-cyan">Rank</span> <span className="text-xs text-neon-purple ml-2">ADMIN</span>
            </span>
          </Link>
          <ProfileDropdown />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage all reported issues and their statuses</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Seed Data Button */}
        {issues.length === 0 && !loading && (
          <div className="mb-8 p-4 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-neon-cyan mb-1">No issues found</p>
                <p className="text-xs text-muted-foreground">Populate the database with realistic demo data for testing</p>
              </div>
              <Link href="/admin/seed" className="px-4 py-2 rounded-lg bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan/50 text-neon-cyan text-sm font-bold uppercase tracking-wide transition-all">
                Seed Database
              </Link>
            </div>
          </div>
        )}

        {/* ── Zones / Clusters Panel ── */}
        {!loading && zones.length > 0 && (
          <div className="mb-10">
            <button
              onClick={() => setShowZones(v => !v)}
              className="flex items-center gap-2 mb-4 text-sm font-bold uppercase tracking-widest text-neon-purple hover:text-neon-purple/80 transition-colors"
            >
              <Layers className="w-4 h-4" />
              Active Zones ({zones.length})
              <span className="text-muted-foreground font-normal normal-case tracking-normal">
                {showZones ? "▲ collapse" : "▼ expand"}
              </span>
            </button>

            {showZones && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map(zone => {
                  const col = SEVERITY_COLORS[zone.severity]
                  return (
                    <div
                      key={zone.id}
                      className="relative p-5 rounded-xl glass-card-strong border overflow-hidden hover-premium"
                      style={{ borderColor: `${col.border}50` }}
                    >
                      {/* Ambient glow */}
                      <div
                        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[60px] opacity-30"
                        style={{ background: col.fill }}
                      />

                      <div className="relative">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span
                              className="text-xs font-black uppercase tracking-widest"
                              style={{ color: col.text }}
                            >
                              {col.label} · {zone.id}
                            </span>
                            <p className="text-lg font-black text-foreground mt-0.5">
                              {zone.issues.length} Issue{zone.issues.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <span
                            className="px-2 py-1 rounded-lg text-xs font-bold border"
                            style={{ background: `${col.border}18`, borderColor: `${col.border}50`, color: col.text }}
                          >
                            Score {zone.clusterScore}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><span className="text-foreground font-semibold">Category:</span> {zone.dominantCategory}</p>
                          <p>
                            <span className="text-foreground font-semibold">Centre:</span>{" "}
                            {zone.centroid.lat.toFixed(3)}, {zone.centroid.lng.toFixed(3)}
                          </p>
                        </div>

                        {/* Severity bar */}
                        <div className="mt-3 h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (zone.clusterScore / 80) * 100)}%`,
                              background: col.border,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Category Tabs */}
        {!loading && (
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg border transition-all font-bold text-sm uppercase tracking-wide hover-pop ${
                  selectedCategory === category
                    ? "bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan glow-cyan"
                    : "bg-[rgba(0,212,255,0.05)] border-neon-cyan/20 text-muted-foreground hover:border-neon-cyan/40 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Verification Filter Bar */}
        {!loading && (
          <div className="mb-8 flex flex-wrap gap-2 items-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold mr-2">Verification:</span>
            {([
              { value: "all",        label: "Show All" },
              { value: "verified",   label: "✅ Verified Only" },
              { value: "unverified", label: "⏳ Not Verified" },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setVerificationFilter(value)}
                className={`px-3 py-1.5 rounded-lg border transition-all font-bold text-xs uppercase tracking-wide hover-pop ${
                  verificationFilter === value
                    ? value === "verified"
                      ? "bg-green-500/20 border-green-500/50 text-green-400"
                      : value === "unverified"
                        ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                        : "bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan"
                    : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)] text-muted-foreground hover:border-neon-cyan/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Issues List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No issues reported yet</p>
          </div>
        ) : sortedIssues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No issues found in {selectedCategory}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedIssues.map((issue) => (
              <div
                key={issue.id}
                className={`relative p-6 rounded-xl glass-card-strong border overflow-hidden group transition-all hover-pop ${
                  !isIssueVerified(issue) ? "opacity-90" : ""
                } ${
                  (issue.reportCount ?? 1) >= 3
                    ? "border-amber-500/50 hover:border-amber-500/70 shadow-amber-500/10 shadow-lg"
                    : "border-neon-cyan/20 hover:border-neon-cyan/40"
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" style={{
                  background: (issue.reportCount ?? 1) >= 3 ? "rgba(245,158,11,0.08)" : "rgba(0,212,255,0.05)"
                }} />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-foreground">{issue.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan uppercase font-bold">
                        {issue.category}
                      </span>
                      {/* Verification Badge */}
                      {isIssueVerified(issue) ? (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-500/20 border border-green-500/30 text-green-400 font-bold">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold">
                          ⏳ Not Verified
                        </span>
                      )}
                      {/* Report count badge */}
                      {(issue.reportCount ?? 1) > 1 && (
                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-bold ${
                          (issue.reportCount ?? 1) >= 3
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                            : "bg-neon-purple/15 border-neon-purple/30 text-neon-purple"
                        }`}>
                          <Users className="w-3 h-3" />
                          {issue.reportCount} reports
                          {(issue.reportCount ?? 1) >= 3 && " 🔥"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Location:</span>{" "}
                        <span className="text-foreground">
                          {issue.location && typeof issue.location === 'object'
                            ? `Lat: ${issue.location.lat?.toFixed(4)}, Lng: ${issue.location.lng?.toFixed(4)}`
                            : issue.location
                              ? issue.location
                              : "No location"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Upvotes:</span>{" "}
                        <span className="text-foreground font-bold">{issue.upvotes}</span>
                      </div>
                      {issue.cluster && (
                        <div>
                          <span className="text-muted-foreground">Cluster:</span>{" "}
                          <span className="text-foreground">{issue.cluster}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Status Badge & Buttons */}
                    <div className={`px-3 py-2 rounded-lg border text-sm font-bold text-center ${getStatusColor(issue.status)}`}>
                      {issue.status.toUpperCase()}
                    </div>

                    {/* Actions */}
                    <select
                      value={issue.status}
                      onChange={(e) =>
                        handleStatusChange(issue.id, e.target.value as "open" | "in-progress" | "resolved")
                      }
                      disabled={updatingId !== null}
                      className="px-3 py-2 bg-[rgba(0,212,255,0.1)] border border-neon-cyan/30 rounded-lg text-sm text-foreground focus:outline-none focus:border-neon-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    <button
                      onClick={() => handleDeleteIssue(issue.id)}
                      disabled={updatingId !== null}
                      className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/10 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover-pop"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && issues.length > 0 && (
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="p-6 rounded-xl glass-card-strong border border-neon-cyan/20">
              <p className="text-muted-foreground text-sm mb-2">Total Issues</p>
              <p className="text-3xl font-bold text-foreground">{issues.length}</p>
            </div>
            <div className="p-6 rounded-xl glass-card-strong border border-neon-cyan/20">
              <p className="text-muted-foreground text-sm mb-2">In Progress</p>
              <p className="text-3xl font-bold text-yellow-400">
                {issues.filter((i) => i.status === "in-progress").length}
              </p>
            </div>
            <div className="p-6 rounded-xl glass-card-strong border border-neon-cyan/20">
              <p className="text-muted-foreground text-sm mb-2">Resolved</p>
              <p className="text-3xl font-bold text-green-400">
                {issues.filter((i) => i.status === "resolved").length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
