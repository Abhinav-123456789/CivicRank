"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.heat"
import { Issue, getIssues } from "@/lib/issues"
import { clusterIssues, SEVERITY_COLORS } from "@/lib/clustering"
import { MapPin, Flame, Layers } from "lucide-react"

// Fix for default marker icons in Leaflet when used with Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Create custom icons based on priority
const createCustomIcon = (
  priority: "low" | "medium" | "high" | "emergency"
) => {
  let color = "#22c55e"
  let shadow = "0 0 6px rgba(34,197,94,0.8)"

  if (priority === "emergency") {
    color = "#ef4444"
    shadow = "0 0 8px rgba(239,68,68,0.9)"
  } else if (priority === "high") {
    color = "#f97316"
    shadow = "0 0 6px rgba(249,115,22,0.8)"
  } else if (priority === "medium") {
    color = "#eab308"
    shadow = "0 0 6px rgba(234,179,8,0.8)"
  }

  return new L.DivIcon({
    html: `<div style="
      background:${color};
      width:16px;
      height:16px;
      border-radius:50%;
      border:2.5px solid rgba(255,255,255,0.85);
      box-shadow:${shadow},0 2px 6px rgba(0,0,0,0.5);
      transition:transform 0.2s;
    "></div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

// Get intensity value based on issue priority
const getIntensity = (issue: Issue): number => {
  switch (issue.priorityLevel) {
    case "emergency":
      return 2.0
    case "high":
      return 1.5
    case "medium":
      return 1.0
    default:
      return 0.6
  }
}

// Heatmap layer component
interface HeatmapLayerProps {
  issues: Issue[]
  show: boolean
}

function HeatmapLayer({ issues, show }: HeatmapLayerProps) {
  const map = useMap()

  useEffect(() => {
    if (!show || issues.length === 0 || !map) return

    

    // Prepare heatmap data from ALL issues (not just first 10)
    const heatData = issues
      .map((issue) => {
        const lat = issue.coords?.lat || (typeof issue.location === 'object' ? issue.location?.lat : null)
        const lng = issue.coords?.lng || (typeof issue.location === 'object' ? issue.location?.lng : null)

        // Guard: skip missing or default fallback (0,0) coordinates
        if (!lat || !lng || (lat === 0 && lng === 0)) return null
        return [
          lat,
          lng,
          getIntensity(issue) * 8
        ]
      })
      .filter((data) => data !== null) as [number, number, number][]

    if (heatData.length === 0) return

    // Create and add heat layer
    const heatLayer = (L as any).heatLayer(heatData, {
  radius: 70,
  blur: 50,
  maxZoom: 17,
  max: 2.5,
  gradient: {
    0.1: "blue",
    0.3: "lime",
    0.5: "yellow",
    0.7: "orange",
    1.0: "red"
  }
})

    heatLayer.addTo(map)
    if (heatData.length > 0) {
  const bounds = L.latLngBounds(
    heatData.map(p => [p[0], p[1]])
  )
  map.fitBounds(bounds, { padding: [50, 50] })
}

    // Cleanup
    return () => {
      map.removeLayer(heatLayer)
    }
  }, [show, issues, map])

  return null
}

// ─── Cluster layer ─────────────────────────────────────────────────────────────
interface ClusterLayerProps {
  issues: Issue[]
  show: boolean
  onClusterClick: (ids: string[]) => void
}

function ClusterLayer({ issues, show, onClusterClick }: ClusterLayerProps) {
  const map = useMap()

  useEffect(() => {
    if (!show || issues.length === 0) return

    const clusters = clusterIssues(issues as any)
    const layers: L.Layer[] = []

    clusters.forEach(cluster => {
      const { fill, border, text } = SEVERITY_COLORS[cluster.severity]
      const count = cluster.issues.length

      // Outer translucent circle
      const circle = L.circle(
        [cluster.centroid.lat, cluster.centroid.lng],
        {
          radius: 600 + count * 80, // grows with issue count
          color: border,
          fillColor: fill,
          fillOpacity: 0.45,
          weight: 2,
          opacity: 0.8,
        }
      )

      // Count label at centroid
      const labelIcon = new L.DivIcon({
        html: `<div style="
          background:${border};
          color:#0a0a0a;
          width:36px;
          height:36px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:900;
          font-size:13px;
          font-family:system-ui,sans-serif;
          box-shadow:0 0 12px ${border}80,0 2px 8px rgba(0,0,0,0.5);
          border:2px solid rgba(255,255,255,0.7);
          cursor:pointer;
        ">${count}</div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const labelMarker = L.marker(
        [cluster.centroid.lat, cluster.centroid.lng],
        { icon: labelIcon, zIndexOffset: 500 }
      )

      const popupContent = `
        <div style="font-family:system-ui,sans-serif;background:#111;color:#e0e0e0;padding:12px 14px;border-radius:12px;min-width:180px;border:1px solid ${border}40;box-shadow:0 8px 24px rgba(0,0,0,0.5)">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:${text};text-transform:uppercase;margin-bottom:6px">
            ${SEVERITY_COLORS[cluster.severity].label} Zone · ${cluster.id}
          </div>
          <div style="font-size:15px;font-weight:900;color:#fff;margin-bottom:4px">${count} Issue${count !== 1 ? 's' : ''}</div>
          <div style="font-size:11px;color:#9ca3af">Category: ${cluster.dominantCategory}</div>
          <div style="font-size:11px;color:#9ca3af">Score: ${cluster.clusterScore}</div>
        </div>`

      circle.bindPopup(popupContent, { className: "cluster-popup" })
      labelMarker.bindPopup(popupContent, { className: "cluster-popup" })

      circle.addTo(map)
      labelMarker.addTo(map)
      layers.push(circle, labelMarker)
    })

    return () => { layers.forEach(l => map.removeLayer(l)) }
  }, [show, issues, map])

  return null
}

export default function MapClient() {
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showClusters, setShowClusters] = useState(false)
  
  // Default map center (India)
  const defaultCenter: [number, number] = [20.5937, 78.9629]
  const center = userLocation || defaultCenter

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await getIssues()
        setIssues(data)
      } catch (err) {
        console.error("Failed to fetch issues for map", err)
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
  }, [])

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case "emergency":
        return "bg-red-500/20 border-red-500/40 text-red-500"
      case "high":
        return "bg-orange-500/20 border-orange-500/40 text-orange-500"
      case "medium":
        return "bg-yellow-500/20 border-yellow-500/40 text-yellow-500"
      default:
        return "bg-green-500/20 border-green-500/40 text-green-500"
    }
  }

  // Render markers
  const renderMarkers = () => {
    return issues.map((issue) => {
      // Support both new schema (`issue.coords`) and old schema (`issue.location` as object)
      const lat = issue.coords?.lat || (typeof issue.location === 'object' ? issue.location.lat : null)
      const lng = issue.coords?.lng || (typeof issue.location === 'object' ? issue.location.lng : null)
      
      if (!lat || !lng) return null

      return (
        <Marker
          key={issue.id}
          position={[lat, lng]}
          icon={createCustomIcon(issue.priorityLevel as any)}
        >
          <Popup className="custom-popup" closeButton={false}>
            <div style={{fontFamily: "system-ui, -apple-system, sans-serif"}} className="p-4 bg-[#111] text-white rounded-xl min-w-[220px] max-w-[260px] border border-neon-cyan/30 flex flex-col gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(0,212,255,0.1)]">
              <div>
                <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{issue.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{issue.description}</p>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getPriorityBadgeStyle(issue.priorityLevel)}`}>
                  {issue.priorityLevel}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-bold flex items-center gap-1">
                  👍 {issue.upvotes}
                </span>
              </div>
              
              <button
                onClick={() => router.push(`/issue/${issue.id}`)}
                className="w-full py-2 rounded-lg bg-neon-cyan/10 hover:bg-neon-cyan/25 border border-neon-cyan/30 hover:border-neon-cyan/60 text-neon-cyan text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]"
              >
                View Details →
              </button>
            </div>
          </Popup>
        </Marker>
      )
    })
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)]">
      {/* UI Controls Overlay */}
      <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
        <div className="p-5 rounded-2xl glass-card-strong border border-neon-cyan/20 backdrop-blur-xl pointer-events-auto max-w-xs">
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
            <span className="p-2 rounded-xl bg-neon-cyan/10">
              <MapPin className="w-5 h-5 text-neon-cyan" />
            </span>
            Issue Map
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loading ? "Loading markers..." : `${issues.length} issues found`}
          </p>
          
          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`w-full mt-2 px-4 py-2 rounded-lg border font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              showHeatmap
                ? "bg-orange-500/20 border-orange-500/40 text-orange-400 hover:bg-orange-500/30"
                : "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20"
            }`}
          >
            <Flame className="w-4 h-4" />
            {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
          </button>

          {/* Clusters Toggle */}
          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`w-full mt-2 px-4 py-2 rounded-lg border font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              showClusters
                ? "bg-neon-purple/20 border-neon-purple/40 text-neon-purple hover:bg-neon-purple/30"
                : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-muted-foreground hover:border-neon-purple/40 hover:text-neon-purple"
            }`}
          >
            <Layers className="w-4 h-4" />
            {showClusters ? "Hide Clusters" : "Show Clusters"}
          </button>
          
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-500">
              <div className="w-3 h-3 rounded-full bg-red-500"></div> Emergency
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-500">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div> High
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-yellow-500">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Medium
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-green-500">
              <div className="w-3 h-3 rounded-full bg-green-500"></div> Low
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin"></div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer 
        center={[20.5937, 78.9629]}
        zoom={5} 
        className="w-full h-full z-0 font-sans"
        zoomControl={false}
      >
        {/* Dark theme tile layer from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Heatmap Layer */}
        <HeatmapLayer issues={issues} show={showHeatmap} />

        {/* Cluster Layer */}
        <ClusterLayer
          issues={issues}
          show={showClusters}
          onClusterClick={() => {}}
        />

        {/* Issue Markers – hidden when heatmap OR clusters active */}
        <div className="dark-leaflet-popups">
          {!showHeatmap && !showClusters && renderMarkers()}
        </div>
      </MapContainer>

      {/* Global styles for dark popups */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: 100% !important;
        }
        .leaflet-popup-tip {
          background: #111 !important;
          border: 1px solid rgba(0, 212, 255, 0.3) !important;
          border-top: none !important;
          border-left: none !important;
          margin-top: -1px !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: white !important;
          padding: 4px 8px 0 0 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          margin-right: 24px !important;
          margin-bottom: 24px !important;
        }
        .leaflet-control-zoom a {
          background-color: rgba(10, 10, 10, 0.8) !important;
          color: #00d4ff !important;
          border: 1px solid rgba(0, 212, 255, 0.3) !important;
          backdrop-filter: blur(16px) !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: rgba(0, 212, 255, 0.1) !important;
          border-color: rgba(0, 212, 255, 0.6) !important;
        }
      `}} />
      
      {/* Error state if no issues found at all - optional overlay */}
      {!loading && issues.length === 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] p-4 rounded-xl glass-card-strong border border-neon-cyan/20 backdrop-blur-xl">
          <p className="text-foreground font-bold">No issues found on the map</p>
          <p className="text-sm text-muted-foreground mt-1 text-center">Issues must have GPS coordinates</p>
        </div>
      )}
    </div>
  )
}
