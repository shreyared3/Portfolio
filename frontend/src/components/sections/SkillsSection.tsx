import {
  FaCode, FaServer, FaDatabase, FaCogs, FaVial, FaPaintBrush, FaBrain, FaComments,
} from "react-icons/fa";
import type { ReactElement } from "react";
import React, { useState } from "react";
import { renderBold } from "../../utils/renderBold";

const iconMap: Record<string, ReactElement> = {
  Frontend:       <FaCode      className="inline-block mr-2 text-indigo-400 text-base" />,
  Backend:        <FaServer    className="inline-block mr-2 text-rose-400 text-base" />,
  Databases:      <FaDatabase  className="inline-block mr-2 text-emerald-400 text-base" />,
  "DevOps & CI/CD": <FaCogs   className="inline-block mr-2 text-yellow-400 text-base" />,
  Testing:        <FaVial      className="inline-block mr-2 text-purple-400 text-base" />,
  "Design Tools": <FaPaintBrush className="inline-block mr-2 text-pink-400 text-base" />,
  "AI Tools":     <FaBrain     className="inline-block mr-2 text-sky-400 text-base" />,
  "Soft Skills":  <FaComments  className="inline-block mr-2 text-gray-400 text-base" />,
};

interface SkillsSectionProps {
  structured: { title?: string; categories?: { title: string; skills: string[] }[] };
  aiText?: string;
}

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
};

const glassBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(15,23,42,0.2)",
  color: "rgba(15,23,42,0.8)",
  borderRadius: 8,
  padding: "6px 16px",
  fontSize: 14,
  cursor: "pointer",
  transition: "background 0.2s",
};

const SkillsSection = ({ structured, aiText }: SkillsSectionProps) => {
  const [showSkills, setShowSkills] = useState(true);
  const [showAI, setShowAI] = useState(true);

  if (!structured?.categories?.length) {
    return <div style={{ color: "rgba(15,23,42,0.5)", textAlign: "center" }}><p>No skill categories found.</p></div>;
  }

  return (
    <div className="skills-section w-full max-w-4xl mx-auto">
      {/* Toggles */}
      <div className="flex justify-end gap-4 mb-6">
        <button onClick={() => setShowSkills(p => !p)} style={glassBtn}>
          {showSkills ? "Hide Skills" : "Show Skills"}
        </button>
        {aiText && (
          <button onClick={() => setShowAI(p => !p)} style={glassBtn}>
            {showAI ? "Hide AI Insights" : "Show AI Insights"}
          </button>
        )}
      </div>

      {/* Skills grid */}
      {showSkills && (
        <section className="text-left mb-8 p-8" style={glass}>
          <h2 className="text-3xl font-bold mb-8" style={{ color: "#0f172a" }}>
            {structured.title || "Skills & Expertise"}
          </h2>
          <div className="max-h-[400px] overflow-y-auto pr-1 space-y-8">
            {structured.categories!.map((cat, idx) => (
              <div key={idx}>
                <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: "rgba(15,23,42,0.85)" }}>
                  {iconMap[cat.title] || null}{cat.title}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {cat.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-1.5 text-sm font-medium rounded-full transition"
                      style={{
                        background: "rgba(15,23,42,0.06)",
                        border: "1px solid rgba(15,23,42,0.15)",
                        color: "rgba(15,23,42,0.8)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Insights */}
      {aiText && showAI && (
        <div className="mt-8 p-6" style={{ ...glass, borderRadius: 16 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "rgba(99,102,241,0.4)", border: "1px solid rgba(99,102,241,0.5)" }}>
              <svg className="w-4 h-4" style={{ color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold" style={{ color: "#0f172a" }}>Core Competencies</h3>
          </div>
          <div>
            {aiText.replace(/^"|"$/g, "").split("\n").filter(l => l.trim()).map((line, idx) => {
              const trimmed = line.replace(/^[-•]\s*/, "").trim();
              return trimmed ? (
                <div key={idx} className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 mt-2"><div className="w-1.5 h-1.5 rounded-full" style={{ background: "#818cf8" }} /></div>
                  <p style={{ color: "rgba(15,23,42,0.75)" }}>{renderBold(trimmed)}</p>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsSection;
