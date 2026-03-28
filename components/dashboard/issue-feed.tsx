import { cn } from "@/lib/utils"
import { ArrowUp, Clock, MapPin, CheckCircle2, AlertCircle } from "lucide-react"

const issues = [
  {
    id: 1,
    title: "Pothole on Main Street",
    city: "Downtown District",
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300&h=200&fit=crop",
    upvotes: 234,
    status: "pending",
    timeAgo: "2h ago",
  },
  {
    id: 2,
    title: "Broken Street Light",
    city: "Riverside Area",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
    upvotes: 156,
    status: "resolved",
    timeAgo: "5h ago",
  },
  {
    id: 3,
    title: "Overflowing Trash Bin",
    city: "Central Park Zone",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&h=200&fit=crop",
    upvotes: 89,
    status: "pending",
    timeAgo: "1d ago",
  },
  {
    id: 4,
    title: "Graffiti on Public Wall",
    city: "Arts District",
    image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=300&h=200&fit=crop",
    upvotes: 67,
    status: "pending",
    timeAgo: "2d ago",
  },
]

export function IssueFeed() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6",
        "bg-[rgba(15,15,20,0.6)] backdrop-blur-xl",
        "border border-[rgba(255,255,255,0.08)]"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          RECENT ISSUES
        </h2>
        <button className="text-xs text-neon-cyan hover:text-neon-cyan/80 hover:underline transition-colors duration-200">View All →</button>
      </div>

      <div className="space-y-0 divide-y divide-[rgba(255,255,255,0.05)]">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className={cn(
              "group flex gap-4 p-3 transition-all duration-300 first:pt-0 last:pb-0",
              "hover:-translate-y-0.5 hover:bg-[rgba(255,255,255,0.03)] rounded-lg",
              "cursor-pointer"
            )}
          >
            {/* Issue Image */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={issue.image}
                alt={issue.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Issue Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-white transition-colors">
                  {issue.title}
                </h3>
                <span
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0",
                    issue.status === "resolved"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  )}
                >
                  {issue.status === "resolved" ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {issue.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                <span>{issue.city}</span>
                <span className="text-[rgba(255,255,255,0.2)]">|</span>
                <Clock className="w-3 h-3" />
                <span>{issue.timeAgo}</span>
              </div>

              {/* Upvotes */}
              <button
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-300",
                  "bg-neon-cyan/10 border border-neon-cyan/20",
                  "hover:bg-neon-cyan/20 hover:border-neon-cyan/40 hover:shadow-[0_0_8px_rgba(0,212,255,0.2)]"
                )}
              >
                <ArrowUp className="w-3 h-3 text-neon-cyan" />
                <span className="text-xs font-bold text-neon-cyan">{issue.upvotes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
