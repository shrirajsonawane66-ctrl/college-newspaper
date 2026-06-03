"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await getSupabase().auth.signInWithPassword({ email, password });

      if (authError) {
        setError(authError.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError("Login failed. No session created.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#1A1410] flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B1D14]/90 via-[#1A1410]/85 to-[#0D0A08]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)]" />
      </div>

      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-amber-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gold/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[460px] mx-4">
        <div
          className="relative p-8 sm:p-10 md:p-12"
          style={{
            backgroundColor: "#F2E7D3",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(176, 138, 74, 0.15)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/40 to-transparent" />
          <div className="absolute top-[3px] left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/20 to-transparent" />
          <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/40 to-transparent" />
          <div className="absolute bottom-[3px] left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/20 to-transparent" />
          <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-[#B08A4A]/30" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-[#B08A4A]/30" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-[#B08A4A]/30" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-[#B08A4A]/30" />

          <div className="relative z-[2]">
            <div className="text-center mb-7">
              <div>
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
                    Est. 2026
                  </span>
                  <div className="h-px w-8 bg-gradient-to-r from-[#B08A4A]/30 to-transparent" />
                </div>
              </div>

              <div className="mt-4 mb-1">
                <div className="font-serif text-[28px] sm:text-[32px] font-bold text-[#2B1D14] tracking-[0.15em] uppercase leading-none">
                  Press Access
                </div>
                <div className="mt-1.5 h-px mx-auto w-16 bg-gradient-to-r from-transparent via-[#B08A4A]/40 to-transparent" />
                <p className="text-[10px] text-[#2B1D14]/50 font-serif italic mt-1.5 tracking-wider">
                  Journalist&apos;s Gateway
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
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

              {error && (
                <p className="text-[11px] text-red-800/80 font-serif bg-red-50/80 border border-red-200/60 px-3 py-1.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2B1D14] text-[#B08A4A] border border-[#B08A4A]/30 text-[11px] uppercase tracking-[0.25em] font-serif font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-t from-[#B08A4A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {loading ? (
                  <>
                    <span className="inline-block w-3 h-3 border border-[#B08A4A]/40 border-t-[#B08A4A] rounded-full animate-spin" />
                    <span className="relative z-[1]">Signing In&hellip;</span>
                  </>
                ) : (
                  <span className="relative z-[1]">Secure Log In</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#B08A4A]/15 text-center space-y-1.5">
              <Link
                href="/"
                className="block text-[10px] font-serif text-[#2B1D14]/50 hover:text-[#B08A4A]/70 transition-colors tracking-wider uppercase"
              >
                &larr; Return to Front Page
              </Link>
              <p className="text-[8px] text-[#2B1D14]/30 font-serif italic">
                Unauthorized access is prohibited &middot; All access is logged
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
