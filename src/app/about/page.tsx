"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import {
  Star, Code, BookOpen, MapPin, Mail, Target,
  Camera, Quote, Sparkles, Cpu, Upload,
} from "lucide-react";
import Link from "next/link";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";

const titleWords = ["The", "Mind", "Behind", "Campus", "Timeline"];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const ease = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } },
};

const cardReveal = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease },
  }),
};

const highlights = [
  { icon: Star, label: "CGPA", value: "9.4", desc: "Academic Excellence" },
  { icon: Code, label: "Full Stack", value: "MERN Stack", desc: "Modern Web Applications" },
  { icon: BookOpen, label: "Data Science", value: "SYDS", desc: "Second Year, Data Science" },
  { icon: Cpu, label: "AI / ML", value: "MLOps", desc: "Advanced Technologies" },
];

const technicalInterests = [
  "React", "Next.js", "Node.js", "TypeScript",
  "Tailwind CSS", "MongoDB", "Python", "SQL",
  "Git", "Docker", "Machine Learning", "Data Analysis",
  "Cloud Computing", "System Design", "MLOps", "Generative AI",
];

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const [profilePic, setProfilePic] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("founderProfilePic");
    if (saved) setProfilePic(saved);
  }, []);

  const handleProfileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setProfilePic(dataUrl);
      localStorage.setItem("founderProfilePic", dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <>
      <BreakingNews />
      <Navbar />
      <Masthead />
      <CategoryNav />
      <main className="newspaper-container py-6 sm:py-10">
        {/* ───── HERO ───── */}
        <section ref={heroRef} className="relative overflow-hidden py-8 sm:py-12 md:py-16">
          <div className="absolute inset-0 pointer-events-none select-none">
            <span className="absolute -top-8 -left-4 sm:-top-12 sm:-left-8 text-[12vw] sm:text-[10vw] md:text-[8vw] font-serif font-black text-ink/[0.03] tracking-tighter leading-none">
              ABOUT
            </span>
            <span className="absolute -bottom-8 -right-4 sm:-bottom-12 sm:-right-8 text-[12vw] sm:text-[10vw] md:text-[8vw] font-serif font-black text-ink/[0.03] tracking-tighter leading-none">
              ABOUT
            </span>
          </div>

          <motion.div
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="relative z-10"
          >
            <motion.div variants={fadeUp} className="section-head mb-4">
              About
            </motion.div>
            <motion.div variants={fadeUp} className="newspaper-rule-thick max-w-[50px] mb-5" />

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-ink leading-[1.08] tracking-tight max-w-4xl">
              {titleWords.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 24 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5, delay: 0.2 + i * 0.07,
                    ease,
                  }}
                  className="inline-block mr-[0.3em]"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-sm sm:text-base text-ink-lighter font-body tracking-wide"
            >
              <span className="text-sepia font-serif italic">Developer</span>
              <span className="text-ink-faded mx-2">&bull;</span>
              <span>Student</span>
              <span className="text-ink-faded mx-2">&bull;</span>
              <span className="text-sepia font-serif italic">Builder</span>
            </motion.p>
          </motion.div>
        </section>

        {/* ───── BIO + PROFILE ───── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 py-6 sm:py-10">
          <div className="lg:col-span-3">
            <AnimatedSection>
              <div className="section-head mb-2">Profile</div>
              <div className="newspaper-rule-thick max-w-[40px] mb-5" />
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-4 text-sm sm:text-base text-ink-light leading-[1.8] font-body"
              >
                <motion.p variants={fadeUp}>
                  Shriraj Sonawane is a <strong className="text-ink font-serif">Data Science</strong> student at Campus with a{" "}
                  <strong className="text-ink font-serif">9.4 CGPA</strong> — driven by a relentless curiosity for how technology
                  shapes our world. As a{" "}
                  <strong className="text-ink font-serif">Full Stack Developer</strong>, he builds end-to-end web
                  applications that balance clean architecture with intuitive user experiences.
                </motion.p>
                <motion.p variants={fadeUp}>
                  Currently immersed in <strong className="text-ink font-serif">AI/ML</strong> and{" "}
                  <strong className="text-ink font-serif">MLOps</strong>, Shriraj explores the intersection of
                  data, infrastructure, and intelligence. His projects span modern frameworks, cloud platforms, and
                  machine learning pipelines — each one a step toward mastery.
                </motion.p>
                <motion.p variants={fadeUp}>
                  Beyond code, he believes in the power of storytelling. At Campus TIMELINE, he merges his technical
                  perspective with editorial craftsmanship to create a newspaper that is both informative and
                  visually compelling.
                </motion.p>
              </motion.div>
            </AnimatedSection>
          </div>

          <div className="lg:col-span-2">
            <AnimatedSection>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
                className="relative"
              >
                <div className="newspaper-card p-5 sm:p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-sepia/5 -mr-8 -mt-8 rounded-full" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/5 -ml-12 -mb-12 rounded-full" />

                  <div className="relative z-10">
                    <div className="relative inline-block group">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-28 h-28 sm:w-32 sm:h-32 mx-auto border-2 border-gold/30 bg-paper-dark flex items-center justify-center relative overflow-hidden cursor-pointer"
                      >
                        {profilePic ? (
                          <img src={profilePic} alt="Shriraj Sonawane" loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-serif text-4xl sm:text-5xl font-bold text-gold/40">S</span>
                        )}
                        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Upload className="w-5 h-5 text-paper" />
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileUpload}
                      />
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 12 }}
                        className="absolute -top-1 -right-1 bg-gold text-paper text-[10px] font-bold px-1.5 py-0.5 leading-none"
                      >
                        9.4
                      </motion.div>
                    </div>
                    <h2 className="mt-3 font-serif text-xl font-bold text-ink">Shriraj Sonawane</h2>
                    <p className="byline mt-0.5">Data Science &middot; SYDS</p>
                    <div className="newspaper-rule-dashed my-3" />
                    <div className="space-y-1.5 text-xs text-ink-light text-left font-body">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-ink-faded shrink-0" />
                        <span>Vashi, Navi Mumbai, Maharashtra</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-ink-faded shrink-0" />
                        <span>shriraj@campus.edu.in</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-ink-faded shrink-0" />
                        <span>Full Stack Developer</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* ───── HIGHLIGHTS ───── */}
        <AnimatedSection className="py-6 sm:py-10">
          <div className="section-head mb-2">Highlights</div>
          <div className="newspaper-rule-thick max-w-[40px] mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {highlights.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={cardReveal}
                  className="newspaper-card p-4 sm:p-5 relative group hover:bg-paper-dark transition-colors"
                >
                  <Icon className="w-4 h-4 text-sepia mb-2" />
                  <div className="section-head text-[10px]">{item.label}</div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-ink mt-0.5">
                    {item.value}
                  </p>
                  <p className="text-[11px] text-ink-faded mt-0.5 font-body">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </AnimatedSection>

        {/* ───── QUOTE DIVIDER ───── */}
        <AnimatedSection className="py-8 sm:py-12">
          <div className="flex items-center gap-4 max-w-2xl mx-auto">
            <div className="flex-1 newspaper-rule-dashed" />
            <Quote className="w-6 h-6 text-sepia/30 shrink-0" />
            <div className="flex-1 newspaper-rule-dashed" />
          </div>
          <blockquote className="mt-4 text-center font-serif text-lg sm:text-xl text-ink-lighter italic leading-relaxed max-w-2xl mx-auto">
            &ldquo;Code is craft. Data is story. Curiosity is the compass.&rdquo;
          </blockquote>
        </AnimatedSection>

        {/* ───── TECHNICAL INTERESTS ───── */}
        <AnimatedSection className="py-6 sm:py-10">
          <div className="section-head mb-2">Technical Interests</div>
          <div className="newspaper-rule-thick max-w-[40px] mb-5" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap gap-2"
          >
            {technicalInterests.map((skill) => (
              <motion.span
                key={skill}
                variants={fadeUp}
                className="px-3 py-1.5 text-[12px] font-body bg-paper-dark border border-border text-ink-light hover:border-sepia/40 hover:text-ink transition-all hover:-translate-y-0.5 cursor-default"
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
        </AnimatedSection>

        {/* ───── SOCIAL ───── */}
        <AnimatedSection className="py-6 sm:py-10">
          <div className="newspaper-card p-5 sm:p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/[0.02] rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-sepia/[0.02] rounded-full -ml-20 -mb-20" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="section-head mb-1">Connect</div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink">Follow the Journey</h3>
                <p className="text-sm text-ink-faded mt-1 font-body">Behind the code, the projects, and the process.</p>
              </div>
              <motion.a
                href="https://instagram.com/shriraj030"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 px-5 py-3 bg-ink text-paper hover:bg-ink-light transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span className="font-serif text-sm font-semibold tracking-wide">@shriraj030</span>
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  className="text-paper/50 group-hover:text-paper transition-colors"
                >
                  &rarr;
                </motion.span>
              </motion.a>
            </div>
          </div>
        </AnimatedSection>

        {/* ───── CLOSING ───── */}
        <AnimatedSection className="py-6 sm:py-10">
          <div className="bg-ink text-paper/80 p-6 sm:p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: "url(/images/myownlogo.png)" }}
            />
            <div className="absolute top-0 right-0 w-48 h-48 bg-paper/[0.02] rounded-full -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/[0.03] rounded-full -ml-16 -mb-16" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease }}
                className="newspaper-rule-thick bg-sepia/40 max-w-[60px] mx-auto mb-4"
              />
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-paper tracking-tight">
                Building the Future
              </h2>
              <p className="mt-2 text-sm sm:text-base text-paper/50 max-w-lg mx-auto leading-relaxed font-body">
                Through code, data, and storytelling — one project, one article, one idea at a time.
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <Sparkles className="w-3 h-3 text-gold/40" />
                <div className="newspaper-rule-dashed max-w-[120px] opacity-20" />
                <Sparkles className="w-3 h-3 text-gold/40" />
              </div>
            </div>
          </div>
        </AnimatedSection>
      </main>
      <Footer />
    </>
  );
}
