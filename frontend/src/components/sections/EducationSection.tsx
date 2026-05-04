import React from "react";

interface EducationItem {
  institution?: string;
  degree?: string;
  field?: string;
  period?: string;
  highlights?: string[];
}

interface EducationSectionProps {
  structured: any;
}

const EducationSection: React.FC<EducationSectionProps> = ({ structured }) => {
  const items: EducationItem[] = structured?.items || [structured];
  const title = structured?.title || "🎓 Education";

  return (
    <div className="text-left space-y-4">
      <h3 className="text-2xl font-semibold" style={{ color: "#0f172a" }}>{title}</h3>
      <div className="space-y-4">
        {items.filter(Boolean).map((ed, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <h4 className="text-lg font-semibold" style={{ color: "#0f172a" }}>{ed.institution}</h4>
            <p className="mb-1" style={{ color: "rgba(15,23,42,0.7)" }}>{[ed.degree, ed.field].filter(Boolean).join(", ")}</p>
            {ed.period && <p className="mb-2" style={{ color: "rgba(15,23,42,0.5)" }}>{ed.period}</p>}
            {ed.highlights && ed.highlights.length > 0 && (
              <ul className="list-disc pl-6 space-y-1" style={{ color: "rgba(15,23,42,0.75)" }}>
                {ed.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationSection;
