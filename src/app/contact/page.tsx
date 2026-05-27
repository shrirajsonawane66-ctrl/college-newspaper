"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, Clock } from "lucide-react";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <BreakingNews />
      <Navbar />
      <Masthead />
      <CategoryNav />
      <main className="newspaper-container py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="newspaper-rule-dashed" />
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-3 tracking-tight">Contact Us</h1>
            <div className="newspaper-rule-thick max-w-[60px] mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="newspaper-card p-5">
                <div className="section-head mb-2">Send a Message</div>
                <div className="newspaper-rule-thick max-w-[40px] mb-4" />
                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                    <div className="w-10 h-10 mx-auto bg-sepia/10 flex items-center justify-center mb-2">
                      <Send className="w-5 h-5 text-sepia" />
                    </div>
                    <p className="font-serif font-bold text-ink">Message Sent</p>
                    <p className="text-sm text-ink-faded mt-1 font-body">We&apos;ll get back to you soon.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" placeholder="Your name" required className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded" />
                      <input type="email" placeholder="Your email" required className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded" />
                    </div>
                    <input type="text" placeholder="Subject" required className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded" />
                    <textarea rows={4} placeholder="Your message..." required className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded resize-none" />
                    <button type="submit" className="px-4 py-2 bg-ink text-paper text-sm font-body font-semibold hover:bg-ink-light transition-colors">
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="newspaper-card p-5">
                <div className="section-head mb-3">Get in Touch</div>
                <div className="space-y-2.5 text-sm text-ink-light font-body">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-ink-faded" />
                    <span>WCCBM Campus, College Road, Nashik, Maharashtra, India</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 shrink-0 text-ink-faded" />
                    <a href="mailto:timeline@wccbm.edu.in" className="vintage-link">timeline@wccbm.edu.in</a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 shrink-0 text-ink-faded" />
                    <span>+91 123-456-7890</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 shrink-0 text-ink-faded" />
                    <span>Mon-Fri: 9 AM - 5 PM</span>
                  </div>
                </div>
              </div>

              <div className="bg-ink text-paper/80 p-5 relative">
                <div className="absolute inset-0 opacity-[0.03] bg-cover bg-center pointer-events-none"
                  style={{ backgroundImage: "url(/images/wccbm-logo.png)" }}
                />
                <div className="relative z-10">
                  <h3 className="font-serif font-bold text-lg text-paper">Got a story?</h3>
                  <p className="text-sm text-paper/60 mt-1 leading-relaxed font-body">
                    Have a news tip or story idea? We&apos;d love to hear from you.
                  </p>
                  <a href="mailto:timeline@wccbm.edu.in" className="inline-block mt-2 text-sm text-sepia-light hover:text-sepia transition-colors font-semibold font-body">
                    timeline@wccbm.edu.in &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
