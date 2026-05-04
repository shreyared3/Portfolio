import React from "react";
import { renderBold } from "../../utils/renderBold";

interface FunSectionProps {
  aiText?: string;
}

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const FunSection: React.FC<FunSectionProps> = ({ aiText }) => {
  const lines = aiText
    ? aiText.split("\n").map((l) => l.trim()).filter(Boolean)
    : [];
  const paragraphs = lines.filter((l) => !/^[-•]\s+/.test(l));
  const bullets = lines.filter((l) => /^[-•]\s+/.test(l)).map((l) => l.replace(/^[-•]\s+/, "").trim());

  if (!aiText) {
    return (
      <div style={{ color: "rgba(15,23,42,0.5)", textAlign: "center" }}>
        <p>No fun &amp; hobbies information available.</p>
      </div>
    );
  }

  return (
    <div className="response-wrapper">
      <div
        className="p-8 text-left flex flex-col justify-center h-auto w-full max-w-2xl mx-auto"
        style={glassCard}
      >
        <h3 className="text-3xl font-bold flex items-center gap-2 mb-4" style={{ color: "#0f172a" }}>
          🎉 Fun &amp; Hobbies
        </h3>

        {paragraphs.map((para, idx) => (
          <p key={`para-${idx}`} className="leading-relaxed text-lg mt-4" style={{ color: "rgba(15,23,42,0.75)" }}>
            {renderBold(para)}
          </p>
        ))}

        {bullets.length > 0 && (
          <ul className="mt-4 list-disc list-inside space-y-2 text-lg leading-relaxed" style={{ color: "rgba(15,23,42,0.75)" }}>
            {bullets.map((point, idx) => <li key={`b-${idx}`}>{renderBold(point)}</li>)}
          </ul>
        )}

        <div className="mt-6 pt-2 text-sm italic" style={{ borderTop: "1px solid rgba(15,23,42,0.1)", color: "rgba(15,23,42,0.45)" }}>
          Life is better with good coffee, fresh air, and a sketchpad nearby ☕🌿✏️
        </div>
      </div>
    </div>
  );
};

export default FunSection;
