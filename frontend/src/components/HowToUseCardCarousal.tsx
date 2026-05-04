'use client';

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface HowToUseModalProps {
  onModalStateChange?: (isOpen: boolean) => void;
}

export default function HowToUseModal({ onModalStateChange }: HowToUseModalProps) {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open]);

  useEffect(() => { onModalStateChange?.(open); }, [open, onModalStateChange]);

  const glassBox: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 32,
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="px-6 py-3 rounded-full text-sm font-semibold shadow-lg transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#000000",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        How this works?
      </motion.button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[9998]"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
              onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto z-[10000] p-10"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                aria-label="Close"
              >
                <svg className="h-5 w-5" style={{ color: "rgba(255,255,255,0.85)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: "rgba(255,255,255,0.95)" }}>
                  Welcome to AI Portfolio
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* How to Use */}
                  <div style={glassBox} className="group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 rounded-xl"
                      style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))" }} />
                    <h3 className="text-2xl font-extrabold mb-6 relative z-10" style={{ color: "rgba(255,255,255,0.95)" }}>
                      How to Use
                    </h3>
                    <p className="text-base leading-relaxed relative z-10" style={{ color: "rgba(255,255,255,0.7)" }}>
                      Enter your questions directly into the chat interface. Utilize quick-action buttons for faster navigation. Explore details about my background, technical skills, or personal interests.
                    </p>
                  </div>

                  {/* Why I created this */}
                  <div style={glassBox} className="group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 rounded-xl"
                      style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(59,130,246,0.15))" }} />
                    <h3 className="text-2xl font-extrabold mb-4 relative z-10" style={{ color: "rgba(255,255,255,0.95)" }}>
                      Why I created this
                    </h3>
                    <p className="text-base leading-relaxed relative z-10" style={{ color: "rgba(255,255,255,0.7)" }}>
                      Most portfolios are static and impersonal. This one is interactive — it adapts to your questions and lets you explore in real time.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-center mt-8">
                  <motion.button
                    onClick={() => setOpen(false)}
                    className="px-6 py-3 rounded-full text-sm font-semibold shadow-lg transition-all duration-200"
                    style={{
                      background: "rgba(139,92,246,0.3)",
                      border: "1px solid rgba(139,92,246,0.5)",
                      color: "#000000",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Chatting
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
