"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface CalendarWidgetProps {
  plain?: boolean;
}

export default function CalendarWidget({ plain }: CalendarWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <LiveCalendar plain={plain} />;
}

function LiveCalendar({ plain }: CalendarWidgetProps) {
  const [now, setNow] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = (hours % 12 || 12).toString().padStart(2, "0");

  const dayAbbr = DAYS[now.getDay()].slice(0, 3);
  const monthAbbr = MONTHS[now.getMonth()].slice(0, 3);

  if (plain) {
    return (
      <div className="relative shrink-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-lighter font-serif leading-none"
        >
          <span className="font-serif font-semibold text-ink-lighter">
            {dayAbbr}, {monthAbbr} {now.getDate()}
          </span>
          <span className="w-px h-3 bg-border shrink-0" />
          <span className="font-clock font-black text-ink tabular-nums tracking-tight">
            {displayHours}:{minutes}
          </span>
          <span className="text-[10px] text-ink-faded font-bold font-clock">{ampm}</span>
          <span className="text-[10px] text-gold font-bold font-clock tabular-nums">
            :{seconds}
          </span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1.5 z-50 min-w-[170px]"
            >
              <div className="bg-paper border-2 border-ink/20 shadow-lg p-4 text-center">
                <div className="font-serif text-lg font-bold text-ink tracking-tight leading-tight">
                  {DAYS[now.getDay()]}
                </div>
                <div className="newspaper-rule-thick max-w-[30px] mx-auto my-1.5" />
                <div className="font-serif text-xs text-ink-light mt-1">
                  {MONTHS[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
                </div>
                <div className="mt-2 font-clock text-xl font-black text-gold tabular-nums tracking-normal">
                  {displayHours}:{minutes}
                  <span className="text-sm text-ink-faded ml-1 font-black">{ampm}</span>
                </div>
                <div className="text-[10px] text-ink-faded mt-1 font-body italic">
                  Edition {now.getDate()}.{now.getMonth() + 1}.{now.getFullYear()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center gap-2 px-2.5 py-1 border border-ink/20 hover:border-ink/40 transition-all bg-paper-dark/30"
      >
        <span className="font-serif text-[11px] font-bold text-ink tracking-tight whitespace-nowrap leading-none">
          {dayAbbr}, {monthAbbr} {now.getDate()}
        </span>
        <span className="w-px h-3 bg-border shrink-0" />
        <span className="font-clock text-xs font-black text-ink tabular-nums tracking-tight leading-none whitespace-nowrap">
          {displayHours}:{minutes}
        </span>
        <span className="text-[10px] text-ink-faded font-bold font-clock leading-none">{ampm}</span>
        <span className="text-[10px] text-gold font-bold font-clock tabular-nums leading-none">
          :{seconds}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 z-50 min-w-[170px]"
          >
            <div className="bg-paper border-2 border-ink/20 shadow-lg p-4 text-center">
              <div className="font-serif text-lg font-bold text-ink tracking-tight leading-tight">
                {DAYS[now.getDay()]}
              </div>
              <div className="newspaper-rule-thick max-w-[30px] mx-auto my-1.5" />
              <div className="font-serif text-xs text-ink-light mt-1">
                {MONTHS[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
              </div>
              <div className="mt-2 font-clock text-xl font-black text-gold tabular-nums tracking-normal">
                {displayHours}:{minutes}
                <span className="text-sm text-ink-faded ml-1 font-black">{ampm}</span>
              </div>
              <div className="text-[10px] text-ink-faded mt-1 font-body italic">
                Edition {now.getDate()}.{now.getMonth() + 1}.{now.getFullYear()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
