"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface ByteBuildersBadgeProps {
  variant?: "fixed" | "inline"
  href?: string
  className?: string
}

export default function ByteBuildersBadge({
  variant = "inline",
  href = "#",
  className = "",
}: ByteBuildersBadgeProps) {
  const badgeContent = (
    <span className="relative inline-block">
      {/* Animated glowing background */}
      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(147, 51, 234, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(147, 51, 234, 0.4);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .bytebuilders-badge {
          animation: glow-pulse 3s ease-in-out infinite, float 4s ease-in-out infinite;
        }

        .bytebuilders-badge:hover {
          animation: glow-pulse 2s ease-in-out infinite, float 4s ease-in-out infinite;
        }
      `}</style>

      <div
        className={cn(
          "bytebuilders-badge",
          "px-5 py-2.5 rounded-full",
          "text-xs sm:text-sm font-bold tracking-widest uppercase",
          "bg-gradient-to-r from-neon-cyan/80 to-neon-purple/80",
          "border border-neon-cyan/50 backdrop-blur-sm",
          "text-white/90 hover:text-white",
          "transition-all duration-300",
          "hover:scale-105 hover:from-neon-cyan to-neon-purple",
          "cursor-pointer select-none",
          "shadow-lg",
          className
        )}
      >
        Built by <span className="font-black ml-1">ByteBuilders</span>
      </div>
    </span>
  )

  if (variant === "fixed") {
    return (
      <div className="fixed bottom-8 right-8 z-40">
        {href && href !== "#" ? (
          <Link href={href} target="_blank" rel="noopener noreferrer">
            {badgeContent}
          </Link>
        ) : (
          badgeContent
        )}
      </div>
    )
  }

  return href && href !== "#" ? (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {badgeContent}
    </Link>
  ) : (
    badgeContent
  )
}
