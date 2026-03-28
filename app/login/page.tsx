"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Mail, Lock, Chrome, ChevronRight } from "lucide-react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db, signInWithGoogle } from "@/lib/firebase"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const redirectByRole = async (uid: string) => {
    const userDocRef = doc(db, "users", uid)
    const docSnap = await getDoc(userDocRef)
    if (docSnap.exists() && docSnap.data()?.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/community")
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setEmailLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await redirectByRole(result.user.uid)
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setEmailLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setGoogleLoading(true)
    try {
      const user = await signInWithGoogle()
      const userEmail = user.email || ""
      if (userEmail === "singhalabhinav182005@gmail.com") {
        router.push("/admin")
      } else {
        router.push("/community")
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Google login failed")
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] cyber-grid flex items-center justify-center relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-cyan/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-purple/12 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[200px]" />
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-500 flex items-center justify-center glow-cyan">
            <MapPin className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Civic<span className="text-neon-cyan">Rank</span>
          </span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground mb-4">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">Sign in to your CivicRank account</p>
        </div>

        {/* Login Card */}
        <div className="relative p-8 rounded-2xl glass-card-strong border border-neon-cyan/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/10 rounded-full blur-[80px] opacity-50" />

          {/* Error */}
          {error && (
            <div className="relative mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="relative space-y-6">
            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-foreground block mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan group-focus-within:drop-shadow-[0_0_8px_rgba(0,212,255,0.6)] transition-all" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={emailLoading}
                  className="w-full pl-12 pr-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(0,212,255,0.2)] rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold uppercase tracking-wider text-foreground block mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan group-focus-within:drop-shadow-[0_0_8px_rgba(0,212,255,0.6)] transition-all" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={emailLoading}
                  className="w-full pl-12 pr-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(0,212,255,0.2)] rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={emailLoading}
              className="w-full group mt-8 relative px-8 py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-blue-500 text-[#0a0a0a] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="flex items-center justify-center gap-2">
                {emailLoading ? "Logging in..." : "Login"}
                {!emailLoading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.1)]" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Or</span>
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.1)]" />
          </div>

          {/* Google login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full group px-8 py-3 rounded-lg border border-neon-cyan/30 text-foreground font-bold uppercase tracking-wider text-sm hover:border-neon-cyan/60 hover-pop transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="w-4 h-4" />
            <span>{googleLoading ? "Signing in..." : "Continue with Google"}</span>
          </button>

          {/* Sign-up link */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-neon-cyan font-bold hover:text-neon-cyan/80 transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
