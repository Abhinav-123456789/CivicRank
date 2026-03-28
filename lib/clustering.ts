/**
 * lib/clustering.ts
 * Greedy spatial clustering for CivicRank issues.
 *
 * Algorithm: iterate issues; assign each to the nearest existing cluster
 * whose centroid is within CLUSTER_RADIUS_METRES. Otherwise create a
 * new cluster. After all issues are assigned, compute score + severity.
 */

import { haversineDistance } from "./issueService"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Severity = "critical" | "high" | "medium"

export interface ClusterIssue {
  id: string
  coords?: { lat: number; lng: number } | null
  category?: string
  upvotes?: number
  reportCount?: number
  priorityLevel?: string
  [key: string]: any
}

export interface IssueCluster {
  /** Unique sequential id: "C1", "C2" … */
  id: string
  /** Centroid of all member coords */
  centroid: { lat: number; lng: number }
  issues: ClusterIssue[]
  /** Weighted importance score */
  clusterScore: number
  severity: Severity
  /** Dominant category among members */
  dominantCategory: string
}

// ─── Configuration ────────────────────────────────────────────────────────────

/** Two issues within this many metres go into the same cluster */
const CLUSTER_RADIUS_METRES = 1000 // 1 km

/** Score thresholds that determine severity */
const SEVERITY_CRITICAL = 40
const SEVERITY_HIGH = 20

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCoords = (issue: ClusterIssue): { lat: number; lng: number } | null => {
  if (issue.coords?.lat && issue.coords?.lng) return issue.coords
  if (typeof issue.location === "object" && issue.location?.lat && issue.location?.lng) {
    return { lat: issue.location.lat, lng: issue.location.lng }
  }
  return null
}

const updateCentroid = (issues: ClusterIssue[]): { lat: number; lng: number } => {
  const withCoords = issues.map(getCoords).filter(Boolean) as { lat: number; lng: number }[]
  if (withCoords.length === 0) return { lat: 0, lng: 0 }
  const lat = withCoords.reduce((s, c) => s + c.lat, 0) / withCoords.length
  const lng = withCoords.reduce((s, c) => s + c.lng, 0) / withCoords.length
  return { lat, lng }
}

const dominantCategory = (issues: ClusterIssue[]): string => {
  const freq: Record<string, number> = {}
  issues.forEach(i => {
    const c = (i.category || "other").toLowerCase()
    freq[c] = (freq[c] || 0) + 1
  })
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "other"
}

const calcScore = (issues: ClusterIssue[]): number => {
  return issues.reduce((total, i) => {
    let s = 10 // base per issue
    s += (i.upvotes ?? 0) * 2
    s += ((i.reportCount ?? 1) - 1) * 5
    if (i.priorityLevel === "emergency") s += 20
    else if (i.priorityLevel === "high") s += 10
    else if (i.priorityLevel === "medium") s += 5
    return total + s
  }, 0)
}

const calcSeverity = (score: number): Severity => {
  if (score >= SEVERITY_CRITICAL) return "critical"
  if (score >= SEVERITY_HIGH) return "high"
  return "medium"
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Groups `issues` into geographic clusters and returns them sorted by
 * clusterScore descending (most critical first).
 *
 * Issues with no coordinates are skipped (they can't be spatially placed).
 */
export const clusterIssues = (issues: ClusterIssue[]): IssueCluster[] => {
  const clusters: Array<{
    centroid: { lat: number; lng: number }
    issues: ClusterIssue[]
  }> = []

  for (const issue of issues) {
    const coords = getCoords(issue)
    if (!coords) continue // skip un-geocoded issues

    // Find nearest existing cluster within radius
    let nearest: typeof clusters[0] | null = null
    let nearestDist = Infinity

    for (const cluster of clusters) {
      const d = haversineDistance(coords, cluster.centroid)
      if (d < nearestDist) {
        nearestDist = d
        nearest = cluster
      }
    }

    if (nearest && nearestDist <= CLUSTER_RADIUS_METRES) {
      nearest.issues.push(issue)
      nearest.centroid = updateCentroid(nearest.issues)
    } else {
      clusters.push({ centroid: coords, issues: [issue] })
    }
  }

  // Convert internal representation → typed IssueCluster[]
  return clusters
    .map((c, i) => {
      const score = calcScore(c.issues)
      return {
        id: `C${i + 1}`,
        centroid: c.centroid,
        issues: c.issues,
        clusterScore: score,
        severity: calcSeverity(score),
        dominantCategory: dominantCategory(c.issues),
      } satisfies IssueCluster
    })
    .sort((a, b) => b.clusterScore - a.clusterScore)
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export const SEVERITY_COLORS: Record<Severity, { fill: string; border: string; text: string; label: string }> = {
  critical: { fill: "rgba(239,68,68,0.25)", border: "#ef4444", text: "#ef4444", label: "Critical" },
  high:     { fill: "rgba(249,115,22,0.20)", border: "#f97316", text: "#f97316", label: "High"     },
  medium:   { fill: "rgba(234,179,8,0.15)",  border: "#eab308", text: "#eab308", label: "Medium"   },
}
