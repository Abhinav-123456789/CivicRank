"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, User, Mail, Lock, Chrome, ChevronRight } from "lucide-react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, signInWithGoogle } from "@/lib/firebase"
import { createUserProfile } from "@/lib/issues"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Create user in Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user profile in mock backend
      await createUserProfile(result.user.uid, {
        name,
        email,
      })

      // Only push after all async operations are complete
      await router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Signup failed")
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError("")
    setGoogleLoading(true)
    try {
      const user = await signInWithGoogle()
      console.log("Google user signed in:", user)
      
      // Create user profile in mock backend
      await createUserProfile(user.uid, {
        name: user.displayName || "Google User",
        email: user.email || "",
      })

      router.push("/community")
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Google signup failed")
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] cyber-grid flex items-center justify-center relative overflow-hidden">
      {/* Enhanced ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-purple/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-purple/12 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-[200px]" />
      </div>

      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-blue-500 flex items-center justify-center glow-purple">
              <MapPin className="w-5 h-5 text-[#0a0a0a]" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Civic<span className="text-neon-purple">Rank</span>
          </span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground mb-4">
            Join CivicRank
          </h1>
          <p className="text-muted-foreground">Create your account and start making an impact</p>
        </div>

        {/* Signup Card */}
        <div className="relative p-8 rounded-2xl glass-card-strong border border-neon-purple/20 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-[80px] opacity-50" />

          {/* Error Message */}
          {error && (
            <div className="relative mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="relative space-y-6">
            {/* Name Input */}
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-foreground block mb-2">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-purple group-focus-within:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(168,85,247,0.2)] rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-foreground block mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-purple group-focus-within:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(168,85,247,0.2)] rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-foreground block mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-purple group-focus-within:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(168,85,247,0.2)] rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group mt-8 relative px-8 py-3 rounded-lg bg-gradient-to-r from-neon-purple to-blue-500 text-[#0a0a0a] font-bold uppercase tracking-wider text-sm glow-purple-intense hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.1)]" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Or</span>
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.1)]" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full group px-8 py-3 rounded-lg border border-neon-purple/30 text-foreground font-bold uppercase tracking-wider text-sm hover:border-neon-purple/60 hover:glow-border-purple transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="w-4 h-4" />
            <span>{googleLoading ? "Signing up..." : "Sign up with Google"}</span>
          </button>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-neon-purple font-bold hover:text-neon-purple/80 transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
