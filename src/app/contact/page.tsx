"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Phone, Clock, Send, CheckCircle, XCircle } from "lucide-react";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const validate = useCallback((): boolean => {
    const e: Partial<Record<string, string>> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email address";
    if (!subject.trim()) e.subject = "Subject is required";
    if (!message.trim()) e.message = "Message is required";
    else if (message.trim().length < 10) e.message = "Message must be at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, email, subject, message]);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const payload = { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() };
    console.log("[Contact] Submitting payload:", payload);

    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .insert([payload]);

      console.log("[Contact] Supabase response:", { data, error });

      if (error) {
        console.error("[Contact] Insert error:", error);
        showToast("error", error.message);
        return;
      }

      console.log("[Contact] Message inserted successfully");
      showToast("success", "Message sent successfully! Our editorial team will respond within 24 hours.");
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setErrors({});
    } catch (err) {
      console.error("[Contact] Unexpected error:", err);
      showToast("error", "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setErrors({});
  };

  return (
    <>
      <BreakingNews />
      <Navbar />
      <Masthead />
      <CategoryNav />

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 text-sm font-body shadow-lg border flex items-center gap-2.5 ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="newspaper-container py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="newspaper-rule-dashed max-w-[200px] mx-auto" />
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl font-black text-ink mt-4 tracking-tight leading-[1.05]"
            >
              Contact Us
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="newspaper-rule-thick max-w-[80px] mx-auto mt-3"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-3 text-sm text-ink-light font-body max-w-xl mx-auto leading-relaxed"
            >
              Have a story tip, editorial inquiry, or feedback? Our newsroom welcomes correspondence from readers.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="border-2 border-ink/15 bg-paper-light p-6 sm:p-8 aged-edge paper-texture relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sepia/40 via-gold/30 to-sepia/40" />

                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-16 h-16 mx-auto bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mb-4"
                      >
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      </motion.div>
                      <h3 className="font-serif text-2xl font-bold text-ink">Message Delivered</h3>
                      <p className="text-sm text-ink-light mt-2 font-body max-w-sm mx-auto leading-relaxed">
                        Your message has been logged in our editorial system. Our team will respond within 24 hours.
                      </p>
                      <div className="newspaper-rule-thick max-w-[40px] mx-auto my-4" />
                      <p className="text-xs text-ink-faded font-body">
                        A confirmation has been recorded. Please allow one business day for a response.
                      </p>
                      <button
                        onClick={handleReset}
                        className="mt-5 px-4 py-2 border border-border text-xs uppercase tracking-wider text-ink-light font-body font-semibold hover:bg-paper-dark transition-colors"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      <div>
                        <div className="section-head mb-1">Editorial Inquiry</div>
                        <div className="newspaper-rule-thick max-w-[40px]" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold font-body">
                            Full Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((prev) => { const n = { ...prev }; delete n.name; return n; }); }}
                            placeholder="John Doe"
                            className="w-full px-3 py-2.5 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 transition-all duration-200 focus:border-gold-light/50"
                          />
                          {errors.name && <p className="text-[10px] text-red-500 font-body">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold font-body">
                            Email Address <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((prev) => { const n = { ...prev }; delete n.email; return n; }); }}
                            placeholder="john@wccbm.edu.in"
                            className="w-full px-3 py-2.5 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 transition-all duration-200 focus:border-gold-light/50"
                          />
                          {errors.email && <p className="text-[10px] text-red-500 font-body">{errors.email}</p>}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold font-body">
                          Subject <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors((prev) => { const n = { ...prev }; delete n.subject; return n; }); }}
                          placeholder="Story Tip, Editorial Feedback, General Inquiry..."
                          className="w-full px-3 py-2.5 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 transition-all duration-200 focus:border-gold-light/50"
                        />
                        {errors.subject && <p className="text-[10px] text-red-500 font-body">{errors.subject}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold font-body">
                            Message <span className="text-red-400">*</span>
                          </label>
                          <span className={`text-[10px] font-body tabular-nums ${message.length < 10 ? "text-red-400" : "text-ink-faded"}`}>
                            {message.length} / 10 min
                          </span>
                        </div>
                        <textarea
                          rows={5}
                          value={message}
                          onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors((prev) => { const n = { ...prev }; delete n.message; return n; }); }}
                          placeholder="Share your story, inquiry, or feedback with our editorial team..."
                          className="w-full px-3 py-2.5 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 resize-none transition-all duration-200 focus:border-gold-light/50 leading-relaxed"
                        />
                        {errors.message && <p className="text-[10px] text-red-500 font-body">{errors.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-ink text-paper text-sm uppercase tracking-wider font-body font-bold hover:bg-ink-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                      >
                        {loading ? (
                          <>
                            <span className="inline-block w-3.5 h-3.5 border border-paper/40 border-t-paper rounded-full animate-spin" />
                            Transmitting&hellip;
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            Send to Editorial Desk
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-5">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="border border-border bg-paper p-5"
              >
                <h3 className="font-serif text-sm font-bold text-ink uppercase tracking-[0.1em] mb-4">Contact Information</h3>
                <div className="newspaper-rule-thick max-w-[30px] mb-4" />
                <div className="space-y-3.5 text-sm text-ink-light font-body">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-ink-faded" />
                    <span className="leading-relaxed">WCCBM Campus, College Road, Nashik, Maharashtra, India</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 shrink-0 text-ink-faded" />
                    <a href="mailto:timeline@wccbm.edu.in" className="vintage-link text-sm">timeline@wccbm.edu.in</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 shrink-0 text-ink-faded" />
                    <span>+91 123-456-7890</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 shrink-0 text-ink-faded" />
                    <span>Monday &ndash; Friday: 9 AM &ndash; 5 PM</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-ink text-paper/80 p-5 relative overflow-hidden aged-edge"
              >
                <div className="absolute inset-0 opacity-[0.04] bg-cover bg-center pointer-events-none"
                  style={{ backgroundImage: "url(/images/wccbm-logo.png)" }}
                />
                <div className="relative z-10">
                  <div className="w-8 h-8 border border-paper/20 flex items-center justify-center mb-3">
                    <Mail className="w-4 h-4 text-gold" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-paper">Got a Story?</h3>
                  <p className="text-sm text-paper/60 mt-1.5 leading-relaxed font-body">
                    Have a news tip, campus scoop, or story idea? Our editors are always looking for the next big story.
                  </p>
                  <div className="newspaper-rule-thick max-w-[30px] opacity-20 my-3" />
                  <a href="mailto:timeline@wccbm.edu.in" className="inline-flex items-center gap-1 text-sm text-sepia-light hover:text-sepia transition-colors font-semibold font-body group">
                    timeline@wccbm.edu.in
                    <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="border border-border bg-paper p-5 text-center"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faded font-body font-semibold">Response Time</p>
                <p className="font-serif text-lg font-bold text-ink mt-1">Within 24 Hours</p>
                <p className="text-[11px] text-ink-light font-body mt-0.5">Our editorial team aims to respond to all inquiries within one business day.</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
