import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const data = [
  { day: "Mon", reports: 12, resolved: 8 },
  { day: "Tue", reports: 19, resolved: 14 },
  { day: "Wed", reports: 8, resolved: 6 },
  { day: "Thu", reports: 24, resolved: 18 },
  { day: "Fri", reports: 31, resolved: 22 },
  { day: "Sat", reports: 18, resolved: 12 },
  { day: "Sun", reports: 22, resolved: 16 },
]

export function ActivityChart() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6",
        "bg-[rgba(15,15,20,0.6)] backdrop-blur-xl",
        "border border-[rgba(255,255,255,0.08)]"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            WEEKLY ACTIVITY
          </h2>
          <p className="text-2xl font-bold text-foreground mt-1">
            134 <span className="text-sm text-neon-cyan">issues reported</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan" />
            <span className="text-xs text-muted-foreground">Reported</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-purple" />
            <span className="text-xs text-muted-foreground">Resolved</span>
          </div>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg bg-[rgba(15,15,20,0.95)] border border-[rgba(255,255,255,0.1)] p-3 shadow-xl backdrop-blur-xl">
                      <p className="text-xs text-muted-foreground mb-2">
                        {payload[0]?.payload?.day}
                      </p>
                      <p className="text-sm text-neon-cyan">
                        {payload[0]?.value} reported
                      </p>
                      <p className="text-sm text-neon-purple">
                        {payload[1]?.value} resolved
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="reports"
              stroke="#00d4ff"
              strokeWidth={2}
              fill="url(#reportGradient)"
            />
            <Area
              type="monotone"
              dataKey="resolved"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#resolvedGradient)"
              yAxisId={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
