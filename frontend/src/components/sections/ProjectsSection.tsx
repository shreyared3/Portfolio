import React, { useState } from "react";
import { ExpandableCard } from "../ExpandableCard";
import { renderBold } from "../../utils/renderBold";

interface ProjectItem {
  name?: string; title?: string; description?: string;
  technologies?: string[] | string; tech?: string[];
  highlights?: string[]; link?: string; github?: string; demo?: string;
}

interface ProjectsSectionProps {
  structured: any;
  aiText?: string;
}

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
};

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ structured, aiText }) => {
  const [showProjects, setShowProjects] = useState(true);
  const [showAI, setShowAI] = useState(true);

  let projects: ProjectItem[] = [];
  if (structured?.items && Array.isArray(structured.items)) {
    projects = structured.items;
  } else if (structured?.projects && Array.isArray(structured.projects)) {
    projects = structured.projects;
  } else if (structured && typeof structured === "object") {
    const p: ProjectItem = {
      name: structured?.name || structured?.title,
      title: structured?.title,
      description: structured?.description,
      technologies: structured?.technologies,
      tech: structured?.tech,
      highlights: structured?.highlights,
      link: structured?.link,
      github: structured?.github,
      demo: structured?.demo,
    };
    if (p.name || p.title || p.description) projects = [p];
  }

  return (
    <div className="projects-section w-full max-w-4xl mx-auto">
      {/* Toggles */}
      <div className="flex justify-end gap-4 mb-6">
        <button onClick={() => setShowProjects(p => !p)} style={glassBtn}>
          {showProjects ? "Hide Projects" : "Show Projects"}
        </button>
        {aiText && (
          <button onClick={() => setShowAI(p => !p)} style={glassBtn}>
            {showAI ? "Hide Project Highlights" : "Show Project Highlights"}
          </button>
        )}
      </div>

      {showProjects && (
        <div className="projects-wrapper w-full mb-8">
          {projects.length > 0 ? (
            <ExpandableCard projects={projects} />
          ) : (
            <div className="text-center py-12">
              <p style={{ color: "rgba(15,23,42,0.5)", fontSize: "1.125rem" }}>No projects found</p>
              <p style={{ color: "rgba(15,23,42,0.35)", fontSize: "0.875rem", marginTop: 8 }}>
                Try asking about my portfolio or specific projects
              </p>
            </div>
          )}
        </div>
      )}

      {aiText && showAI && (
        <div
          className="mt-8 p-6"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "rgba(59,130,246,0.35)", border: "1px solid rgba(59,130,246,0.5)" }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold" style={{ color: "#0f172a" }}>Project Highlights</h3>
          </div>
          <div>
            {aiText.split("\n").filter(l => l.trim()).map((line, idx) => {
              const trimmed = line.trim();
              const isBullet = /^[-•]\s+/.test(trimmed);
              return isBullet ? (
                <div key={idx} className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 mt-2"><div className="w-1.5 h-1.5 rounded-full" style={{ background: "#60a5fa" }} /></div>
                  <p style={{ color: "rgba(15,23,42,0.75)" }}>{renderBold(trimmed.replace(/^[-•]\s+/, ""))}</p>
                </div>
              ) : (
                <p key={idx} className="mb-3 font-semibold" style={{ color: "rgba(15,23,42,0.85)" }}>{renderBold(trimmed)}</p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
