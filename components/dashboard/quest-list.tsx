import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Clock, Award } from "lucide-react"

const tasks = [
  {
    id: 1,
    title: "Report 3 Local Issues",
    reward: 150,
    progress: 2,
    total: 3,
    status: "in_progress",
    timeLeft: "4h 23m",
  },
  {
    id: 2,
    title: "Verify 5 Community Reports",
    reward: 200,
    progress: 3,
    total: 5,
    status: "in_progress",
    timeLeft: "8h 15m",
  },
  {
    id: 3,
    title: "Share Issue on Social Media",
    reward: 50,
    progress: 1,
    total: 1,
    status: "completed",
  },
  {
    id: 4,
    title: "Upvote 10 Active Issues",
    reward: 75,
    progress: 4,
    total: 10,
    status: "in_progress",
    timeLeft: "12h 45m",
  },
]

export function DailyTasks() {
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
          DAILY CIVIC TASKS
        </h2>
        <span className="text-xs text-emerald-400">1/4 Complete</span>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => {
          const progressPercent = (task.progress / task.total) * 100
          const isCompleted = task.status === "completed"

          return (
            <div
              key={task.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-300",
                isCompleted
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-neon-cyan/30"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Status icon */}
                <div className="pt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={cn(
                        "text-sm font-medium",
                        isCompleted
                          ? "text-emerald-400 line-through opacity-70"
                          : "text-foreground"
                      )}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-neon-cyan/10">
                      <Award className="w-3 h-3 text-neon-cyan" />
                      <span className="text-xs font-bold text-neon-cyan">
                        +{task.reward}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-1.5 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden mb-2">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isCompleted
                          ? "bg-emerald-500"
                          : "bg-gradient-to-r from-neon-cyan to-neon-purple"
                      )}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {task.progress}/{task.total}
                    </span>
                    {!isCompleted && task.timeLeft && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.timeLeft}</span>
                      </div>
                    )}
                    {isCompleted && (
                      <span className="text-emerald-400">Claimed!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
