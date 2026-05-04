import React from "react";
import ReactMarkdown from "react-markdown";

interface GeneralSectionProps {
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

const GeneralSection: React.FC<GeneralSectionProps> = ({ aiText }) => {
  if (!aiText) return null;

  return (
    <div className="response-wrapper" style={{ maxWidth: "42rem", margin: "0 auto" }}>
      <div className="p-8 text-left w-full" style={glassCard}>
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p style={{ color: "#0f172a", lineHeight: 1.7, fontSize: 16, marginBottom: 10 }}>{children}</p>
            ),
            ul: ({ children }) => (
              <ul style={{ color: "#0f172a", paddingLeft: 20, marginBottom: 10, lineHeight: 1.7 }}>{children}</ul>
            ),
            ol: ({ children }) => (
              <ol style={{ color: "#0f172a", paddingLeft: 20, marginBottom: 10, lineHeight: 1.7 }}>{children}</ol>
            ),
            li: ({ children }) => (
              <li style={{ color: "#0f172a", marginBottom: 6, fontSize: 15 }}>{children}</li>
            ),
            strong: ({ children }) => (
              <strong style={{ color: "#0f172a", fontWeight: 600 }}>{children}</strong>
            ),
            table: ({ children }) => (
              <div style={{ overflowX: "auto", marginBottom: 12 }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th style={{ background: "rgba(15,23,42,0.08)", color: "#0f172a", fontWeight: 600, padding: "8px 12px", border: "1px solid rgba(15,23,42,0.15)", textAlign: "left" }}>{children}</th>
            ),
            td: ({ children }) => (
              <td style={{ color: "#0f172a", padding: "7px 12px", border: "1px solid rgba(15,23,42,0.12)" }}>{children}</td>
            ),
            tr: ({ children }) => (
              <tr style={{ borderBottom: "1px solid rgba(15,23,42,0.1)" }}>{children}</tr>
            ),
          }}
        >
          {aiText}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default GeneralSection;
