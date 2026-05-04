"use client";

import { useEffect, useId, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../hooks/use-outside-click";

interface ProjectItem {
  name?: string; title?: string; description?: string;
  technologies?: string[] | string; tech?: string[];
  highlights?: string[]; link?: string; github?: string; demo?: string;
}

interface ExpandableCardProps {
  projects: ProjectItem[];
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.15)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
};

export function ExpandableCard({ projects }: ExpandableCardProps) {
  const [active, setActive] = useState<ProjectItem | null>(null);
  const id = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    document.body.style.overflow = active ? "hidden" : "auto";
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const outsideClickRef = useOutsideClick<HTMLDivElement>(() => setActive(null));
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
    setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      setShowLeft(el.scrollLeft > 5);
      setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    }, 300);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setShowLeft(el.scrollLeft > 5);
      setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => { el.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  const techList = (p: ProjectItem) =>
    (Array.isArray(p.technologies) ? p.technologies : Array.isArray(p.tech) ? p.tech
      : String(p.technologies || p.tech || "").split(/\s*,\s*/)).filter(Boolean);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 h-full w-full z-10"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          />
        )}
      </AnimatePresence>

      {/* Expanded modal */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 flex justify-center z-[100] p-4">
            <motion.button
              key={`close-${active.name || active.title}-${id}`}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}
              className="absolute top-4 right-4 lg:hidden flex items-center justify-center h-8 w-8 z-20 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              ref={outsideClickRef}
              initial={{ scale: 0.85, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 50 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full max-w-[800px] max-h-[90vh] overflow-y-auto flex flex-col rounded-3xl overflow-hidden"
              style={glass}
            >
              {/* Modal header */}
              <div className="relative h-16 px-6 flex items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <h2 className="text-xl font-semibold" style={{ color: "rgba(255,255,255,0.95)" }}>Project Overview</h2>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                {/* Sub-header */}
                <div className="flex-shrink-0 p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-2xl mb-2" style={{ color: "rgba(255,255,255,0.95)" }}>
                      {active.name || active.title || "Untitled Project"}
                    </h3>
                    <div className="flex gap-3 ml-6">
                      {active.github && (
                        <a href={active.github} target="_blank" rel="noreferrer"
                          className="px-4 py-2 text-sm rounded-full font-semibold text-white transition-all"
                          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                          GitHub
                        </a>
                      )}
                      {active.demo && (
                        <a href={active.demo} target="_blank" rel="noreferrer"
                          className="px-4 py-2 text-sm rounded-full font-semibold text-white transition-all"
                          style={{ background: "rgba(236,72,153,0.35)", border: "1px solid rgba(236,72,153,0.4)" }}>
                          Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 space-y-10">
                  {Array.isArray(active.highlights) && active.highlights.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 rounded-sm" style={{ background: "#818cf8" }} />
                        <h4 className="text-lg font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>Key Contributions</h4>
                      </div>
                      <ul className="space-y-3 list-none">
                        {active.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                            <span className="mt-1.5" style={{ color: "#818cf8" }}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4" /></svg>
                            </span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {(active.technologies || active.tech) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 rounded-sm" style={{ background: "#f43f5e" }} />
                        <h4 className="text-lg font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>Technologies Used</h4>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {techList(active).map((t, i) => (
                          <span key={i} className="px-5 py-3 text-xs rounded-full font-semibold text-white"
                            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Card grid */}
      <div className="relative max-w-7xl mx-auto w-full">
        {showLeft && (
          <button onClick={() => scroll("left")}
            className="hidden md:flex absolute left-[-40px] top-1/2 -translate-y-1/2 z-10 p-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
            <ChevronLeft />
          </button>
        )}

        <div ref={scrollRef} className="scroll-smooth flex overflow-x-auto gap-4 px-8 py-6 snap-x snap-mandatory hide-scrollbar">
          {projects.map((project) => (
            <motion.div
              key={`card-${project.name || project.title}-${id}`}
              layoutId={`card-${project.name || project.title}-${id}`}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              whileHover={{ rotate: [0, -4, 4, -4, 4, -2, 2, 0], scale: 1.03 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              onClick={() => setActive(project)}
              className="flex-shrink-0 w-[280px] sm:w-[280px] md:w-[300px] h-[320px] snap-start p-6 rounded-2xl cursor-pointer transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              <div className="flex flex-col h-48 overflow-auto">
                <div className="flex-1">
                  <motion.h3
                    layoutId={`title-${project.name || project.title}-${id}`}
                    className="font-bold text-lg mb-3 line-clamp-2"
                    style={{ color: "rgba(255,255,255,0.95)" }}
                  >
                    {project.name || project.title || "Untitled Project"}
                  </motion.h3>
                  {project.description && (
                    <p className="text-sm mb-4 line-clamp-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {project.description}
                    </p>
                  )}
                </div>

                {(project.technologies || project.tech) && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {techList(project).slice(0, 3).map((t, i) => (
                      <span key={i} className="px-3 py-1 text-xs rounded-full font-medium"
                        style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.35)", color: "#c4b5fd" }}>
                        {t}
                      </span>
                    ))}
                    {techList(project).length > 3 && (
                      <span className="px-3 py-1 text-xs rounded-full font-medium"
                        style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.35)", color: "#c4b5fd" }}>
                        +{techList(project).length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-wrap gap-2 justify-center">
                {project.github && (
                  <motion.a layoutId={`github-${project.name || project.title}-${id}`}
                    href={project.github} target="_blank" rel="noreferrer"
                    className="px-3 py-2 text-xs rounded-full font-semibold text-white flex items-center gap-1"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                    onClick={(e) => e.stopPropagation()}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </motion.a>
                )}
                {project.demo && (
                  <motion.a layoutId={`demo-${project.name || project.title}-${id}`}
                    href={project.demo} target="_blank" rel="noreferrer"
                    className="px-3 py-2 text-xs rounded-full font-semibold text-white flex items-center gap-1"
                    style={{ background: "rgba(236,72,153,0.35)", border: "1px solid rgba(236,72,153,0.4)" }}
                    onClick={(e) => e.stopPropagation()}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Demo
                  </motion.a>
                )}
                <motion.button
                  layoutId={`button-${project.name || project.title}-${id}`}
                  className="px-4 py-2 text-xs rounded-full font-semibold text-white flex items-center gap-1"
                  style={{ background: "rgba(139,92,246,0.35)", border: "1px solid rgba(139,92,246,0.4)" }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Details
                </motion.button>
              </div>
            </motion.div>
          ))}

          {showRight && (
            <button onClick={() => scroll("right")}
              className="hidden md:flex absolute right-[-40px] top-1/2 -translate-y-1/2 z-10 p-2 rounded-full"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
              <ChevronRight />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: "rgba(255,255,255,0.8)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: "rgba(255,255,255,0.8)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export const CloseIcon = () => (
  <motion.svg
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.05 } }}
    xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="h-4 w-4" style={{ color: "rgba(255,255,255,0.7)" }}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
);
