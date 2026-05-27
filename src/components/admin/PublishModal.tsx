"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, Send, FileText, AlertTriangle } from "lucide-react";

type PublishAction = "publish" | "draft" | null;

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (action: "publish" | "draft") => Promise<void>;
  title: string;
}

type Status = "confirm" | "publishing" | "success" | "error";

export default function PublishModal({ open, onClose, onConfirm, title }: PublishModalProps) {
  const [status, setStatus] = useState<Status>("confirm");
  const [action, setAction] = useState<PublishAction>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStatus("confirm");
        setAction(null);
        setError("");
      }, 300);
    }
  }, [open]);

  const handleConfirm = async (selectedAction: "publish" | "draft") => {
    setAction(selectedAction);
    setStatus("publishing");
    setError("");

    try {
      await onConfirm(selectedAction);
      setStatus("success");
      setTimeout(() => onClose(), 2000);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md mx-4 z-10"
          >
            <div className="bg-paper border border-gold/20 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-serif text-lg font-bold text-ink tracking-tight">
                  {status === "confirm" && "Publish Article"}
                  {status === "publishing" && "Publishing&hellip;"}
                  {status === "success" && "Published!"}
                  {status === "error" && "Publishing Failed"}
                </h2>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                {status === "confirm" && (
                  <div className="space-y-3">
                    <p className="text-sm text-ink-light font-body leading-relaxed">
                      Ready to publish <strong className="text-ink">&ldquo;{title}&rdquo;</strong>?
                    </p>
                    <p className="text-[11px] text-ink-faded font-body">
                      Choose whether to publish immediately or save as a draft for later review.
                    </p>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleConfirm("publish")}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gold text-paper text-xs uppercase tracking-wider font-body font-bold hover:bg-gold/90 transition-colors shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Publish Now
                      </button>
                      <button
                        onClick={() => handleConfirm("draft")}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border text-xs uppercase tracking-wider text-ink-light font-body font-semibold hover:bg-paper-dark transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Save as Draft
                      </button>
                    </div>
                  </div>
                )}

                {status === "publishing" && (
                  <div className="text-center py-6">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 mx-auto rounded-full border-2 border-gold/30 flex items-center justify-center"
                    >
                      <Clock className="w-6 h-6 text-gold animate-float" />
                    </motion.div>
                    <p className="mt-3 text-sm text-ink-light font-body">
                      {action === "publish" ? "Publishing article to the front page&hellip;" : "Saving article as draft&hellip;"}
                    </p>
                    <div className="mt-4 w-48 mx-auto bg-border rounded-full h-1">
                      <motion.div
                        className="h-full bg-gold rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                )}

                {status === "success" && (
                  <div className="text-center py-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
                    </motion.div>
                    <p className="mt-3 text-sm text-ink font-body font-semibold">
                      {action === "publish" ? "Article published successfully!" : "Draft saved!"}
                    </p>
                    <p className="text-[11px] text-ink-faded font-body mt-0.5">
                      {action === "publish"
                        ? "Your article is now live on the website."
                        : "You can continue editing or publish later."}
                    </p>
                  </div>
                )}

                {status === "error" && (
                  <div className="text-center py-6">
                    <AlertTriangle className="w-16 h-16 text-red-400 mx-auto" />
                    <p className="mt-3 text-sm text-red-700 font-body">{error}</p>
                    <button
                      onClick={() => setStatus("confirm")}
                      className="mt-3 px-4 py-1.5 border border-border text-xs uppercase tracking-wider font-body font-semibold text-ink-light hover:bg-paper-dark transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
