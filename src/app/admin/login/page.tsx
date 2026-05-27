"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function DustParticle({ index }: { index: number }) {
  const x = useRef(randomBetween(0, 100));
  const duration = useRef(randomBetween(12, 30));
  const delay = useRef(randomBetween(0, 20));
  const size = useRef(randomBetween(1, 3));

  return (
    <motion.div
      className="absolute rounded-full bg-amber-200/30 pointer-events-none"
      style={{
        left: `${x.current}%`,
        width: size.current,
        height: size.current,
      }}
      initial={{ opacity: 0, y: "100vh" }}
      animate={{
        opacity: [0, 0.6, 0.3, 0],
        y: ["100vh", "-10vh"],
      }}
      transition={{
        duration: duration.current,
        repeat: Infinity,
        delay: delay.current,
        ease: "linear",
      }}
    />
  );
}

export default function AdminLogin() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const dustCount = 25;

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    (async () => {
      try {
        const res = await fetch(`${url}/rest/v1/`, {
          headers: { apikey: key!, Authorization: `Bearer ${key!}` },
        });
        console.log("Supabase raw fetch status:", res.status, res.statusText);
        const t = await res.text();
        console.log("Supabase raw fetch body:", t.slice(0, 200));
      } catch (e: any) {
        console.error("Supabase raw fetch failed:", e?.message || e);
      }
    })();

    supabase.from("articles").select("*", { count: "exact", head: true }).then(({ error: connErr }) => {
      if (connErr) console.error("Supabase connection test failed:", connErr);
      else console.log("Supabase connection test: OK");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        console.error("Supabase returned error:", authError);
        setError(authError.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (!data.session) {
        console.error("Login failure: no session returned");
        setError("Login failed. No session created.");
        setLoading(false);
        return;
      }

      console.log("Login success. Session user:", data.session.user.email);
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Login failure (exception):", err);
      if (err?.message === "Failed to fetch") {
        setError("Cannot reach Supabase. Your project may be paused or deleted.");
      } else {
        setError(err?.message || "An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#1A1410] flex items-center justify-center">
      {/* ─── Cinematic Background ─── */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Cdefs%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.015' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='1600' height='900' fill='%232B1D14'/%3E%3Crect width='1600' height='900' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Warm amber gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B1D14]/90 via-[#1A1410]/85 to-[#0D0A08]/95" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)]" />
        {/* Film grain */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ─── Floating Dust Particles ─── */}
      {mounted && (
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          {Array.from({ length: dustCount }).map((_, i) => (
            <DustParticle key={i} index={i} />
          ))}
        </div>
      )}

      {/* ─── Decorative Light Orbs ─── */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-amber-900/10 blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: "6s" }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gold/5 blur-[80px] animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />

      {/* ─── Login Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[460px] mx-4"
      >
        <div
          className="relative p-8 sm:p-10 md:p-12"
          style={{
            backgroundColor: "#F2E7D3",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(176, 138, 74, 0.15)",
          }}
        >
          {/* Paper grain texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Decorative top border */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/40 to-transparent" />
          <div className="absolute top-[3px] left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/20 to-transparent" />

          {/* Decorative bottom border */}
          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/40 to-transparent" />
          <div className="absolute bottom-[3px] left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/20 to-transparent" />

          {/* Corner ornaments */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-[#B08A4A]/30" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-[#B08A4A]/30" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-[#B08A4A]/30" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-[#B08A4A]/30" />

          <div className="relative z-[2]">
            {/* ─── Header ─── */}
            <div className="text-center mb-7">
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                <img
                  src="/images/wccbm-logo.png"
                  alt="WCCBM"
                  className="w-16 h-16 mx-auto mb-3 object-contain opacity-90"
                />
                <h1 className="font-serif text-[11px] tracking-[0.35em] text-[#2B1D14]/60 font-semibold uppercase">
                  WCCBM TIMELINE
                </h1>
                <div className="flex items-center justify-center gap-2 my-2.5">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#B08A4A]/30" />
                  <span className="text-[8px] tracking-[0.3em] text-[#B08A4A]/60 font-serif font-semibold uppercase">
                    Est. 1965
                  </span>
                  <div className="h-px w-8 bg-gradient-to-r from-[#B08A4A]/30 to-transparent" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="mt-4 mb-1"
              >
                <div className="font-serif text-[28px] sm:text-[32px] font-bold text-[#2B1D14] tracking-[0.15em] uppercase leading-none">
                  Press Access
                </div>
                <div className="mt-1.5 h-px mx-auto w-16 bg-gradient-to-r from-transparent via-[#B08A4A]/40 to-transparent" />
                <p className="text-[10px] text-[#2B1D14]/50 font-serif italic mt-1.5 tracking-wider">
                  Journalist&apos;s Gateway
                </p>
              </motion.div>
            </div>

            {/* ─── Form ─── */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-[9px] uppercase tracking-[0.25em] text-[#2B1D14]/60 mb-1.5 font-serif font-semibold">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reporter@wccbm.edu.in"
                    required
                    className="w-full px-3.5 py-2.5 text-sm font-serif text-[#2B1D14] bg-[#E7D8BC] border border-[#B08A4A]/25 focus:outline-none transition-all duration-300 placeholder:text-[#2B1D14]/25 focus:border-[#B08A4A]/60 focus:bg-[#E7D8BC] focus:shadow-[inset_0_1px_3px_rgba(176,138,74,0.08)]"
                    style={{ boxShadow: "inset 0 1px 2px rgba(43, 29, 20, 0.06)" }}
                  />
                  <div className="absolute inset-0 border border-transparent group-focus-within:border-[#B08A4A]/20 pointer-events-none transition-colors duration-300" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[9px] uppercase tracking-[0.25em] text-[#2B1D14]/60 mb-1.5 font-serif font-semibold">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter access key"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 text-sm font-serif text-[#2B1D14] bg-[#E7D8BC] border border-[#B08A4A]/25 focus:outline-none transition-all duration-300 placeholder:text-[#2B1D14]/25 focus:border-[#B08A4A]/60 focus:bg-[#E7D8BC] focus:shadow-[inset_0_1px_3px_rgba(176,138,74,0.08)]"
                    style={{ boxShadow: "inset 0 1px 2px rgba(43, 29, 20, 0.06)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#2B1D14]/35 hover:text-[#B08A4A]/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#B08A4A]/30 pointer-events-none hidden sm:block">
                    <KeyRound className="w-3 h-3" />
                  </div>
                  <div className="absolute inset-0 border border-transparent group-focus-within:border-[#B08A4A]/20 pointer-events-none transition-colors duration-300" />
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-red-800/80 font-serif bg-red-50/80 border border-red-200/60 px-3 py-1.5"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 bg-[#2B1D14] text-[#B08A4A] border border-[#B08A4A]/30 text-[11px] uppercase tracking-[0.25em] font-serif font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-t from-[#B08A4A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="absolute -inset-x-full top-0 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/40 to-transparent group-hover:animate-shimmer" />
                {loading ? (
                  <>
                    <span className="inline-block w-3 h-3 border border-[#B08A4A]/40 border-t-[#B08A4A] rounded-full animate-spin" />
                    <span className="relative z-[1]">Signing In&hellip;</span>
                  </>
                ) : (
                  <span className="relative z-[1]">Secure Log In</span>
                )}
              </motion.button>

              {/* Animated typewriter cursor */}
              <div className="flex items-center justify-center gap-1 text-[#2B1D14]/30 pt-1">
                <span className="text-[9px] font-serif italic tracking-wider">authenticating</span>
                <span className="inline-block w-[2px] h-3.5 bg-[#2B1D14]/30 animate-pulse" />
              </div>
            </motion.form>

            {/* ─── Footer ─── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-6 pt-4 border-t border-[#B08A4A]/15 text-center space-y-1.5"
            >
              <Link
                href="/"
                className="block text-[10px] font-serif text-[#2B1D14]/50 hover:text-[#B08A4A]/70 transition-colors tracking-wider uppercase"
              >
                &larr; Return to Front Page
              </Link>
              <p className="text-[8px] text-[#2B1D14]/30 font-serif italic">
                Unauthorized access is prohibited &middot; All access is logged
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
