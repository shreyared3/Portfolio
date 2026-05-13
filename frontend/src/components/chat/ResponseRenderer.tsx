import React from "react";
import { motion } from "framer-motion";
import MeSection from "../sections/MeSection";
import ProjectsSection from "../sections/ProjectsSection";
import ExperienceSection from "../sections/ExperienceSection";
import SkillsSection from "../sections/SkillsSection";
import FunSection from "../sections/FunSection";
import ContactSection from "../sections/ContactSection";
import EducationSection from "../sections/EducationSection";
import GeneralSection from "../sections/GeneralSection";
import { ResponseRendererProps } from "../../types/chat";

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ interaction }) => {
  if (interaction.isLoading && !interaction.response) {
    return (
      <motion.div
        className="response-container"
        style={{ textAlign: "center", marginBottom: 32, width: "100%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <style>{`
          @keyframes loader-animation {
            0%, 70%, 100% {
              background-position: calc(0 * 100% / 3) 50%, calc(1 * 100% / 3) 50%, calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 50%;
            }
            11.67% { background-position: calc(0 * 100% / 3) 0, calc(1 * 100% / 3) 50%, calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 50%; }
            23.33% { background-position: calc(0 * 100% / 3) 100%, calc(1 * 100% / 3) 0, calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 50%; }
            35%     { background-position: calc(0 * 100% / 3) 50%, calc(1 * 100% / 3) 100%, calc(2 * 100% / 3) 0, calc(3 * 100% / 3) 50%; }
            46.67%  { background-position: calc(0 * 100% / 3) 50%, calc(1 * 100% / 3) 50%, calc(2 * 100% / 3) 100%, calc(3 * 100% / 3) 0; }
            58.34%  { background-position: calc(0 * 100% / 3) 50%, calc(1 * 100% / 3) 50%, calc(2 * 100% / 3) 50%, calc(3 * 100% / 3) 100%; }
          }
        `}</style>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div
            className="loader"
            style={{
              height: 9,
              width: 60,
              background:
                "no-repeat linear-gradient(rgba(255,255,255,0.7) 0 0), no-repeat linear-gradient(rgba(255,255,255,0.7) 0 0), no-repeat linear-gradient(rgba(255,255,255,0.7) 0 0), no-repeat linear-gradient(rgba(255,255,255,0.7) 0 0)",
              backgroundSize: "26% 3px",
              animation: "loader-animation 1s infinite",
            }}
          />
        </div>
      </motion.div>
    );
  }

  // Streaming in progress — render plain text, no markdown parsing overhead
  if (interaction.isStreaming && interaction.response) {
    return (
      <motion.div
        className="response-container"
        style={{ textAlign: "center", marginBottom: 32, width: "100%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="response-wrapper" style={{ maxWidth: "42rem", margin: "0 auto" }}>
          <div
            className="p-8 text-left w-full"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 20,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
              whiteSpace: "pre-wrap",
              color: "#0f172a",
              lineHeight: 1.7,
              fontSize: 15,
            }}
          >
            {interaction.response}
          </div>
        </div>
      </motion.div>
    );
  }

  // Done — render with full markdown
  if (interaction.structured) {
    return (
      <motion.div
        className="response-container"
        style={{ textAlign: "center", marginBottom: 32, width: "100%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="response-wrapper" style={{ maxWidth: "none", margin: 0, width: "100%", textAlign: "left" }}>
          {renderStructured(interaction.structured, interaction.response)}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="response-container"
      style={{ textAlign: "center", marginBottom: 32, width: "100%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="response-wrapper" style={{ maxWidth: "32rem", margin: "0 auto" }}>
        <p className="response-text" style={{ color: "#0f172a", lineHeight: 1.625, fontSize: 18 }}>
          {interaction.response}
        </p>
      </div>
    </motion.div>
  );
};

function renderStructured(structured: any, response?: string) {
  const type = structured?.type;
  const normalizedData = {
    ...structured,
    name: structured?.name || structured?.title,
    text: structured?.text || structured?.content,
    summary: structured?.summary || structured?.text || structured?.content,
    response,
  };
  switch (type) {
    case "general":
      return <GeneralSection aiText={structured.aiText || response || ""} />;
    case "me":
    case "about":
      return <MeSection aiText={structured.aiText || response || ""} />;
    case "projects":
    case "project":
      return <ProjectsSection structured={normalizedData} aiText={normalizedData.response || normalizedData.aiText} />;
    case "experience":
      return <ExperienceSection structured={normalizedData} aiText={normalizedData.response || normalizedData.aiText} />;
    case "skills":
    case "skill":
      return <SkillsSection structured={normalizedData} aiText={normalizedData.response || normalizedData.aiText} />;
    case "fun":
      return <FunSection aiText={normalizedData.response || normalizedData.aiText} />;
    case "contact":
      return <ContactSection structured={normalizedData} />;
    case "education":
      return <EducationSection structured={normalizedData} />;
    default:
      return <p className="response-text" style={{ color: "#0f172a" }}>{normalizedData?.text || ""}</p>;
  }
}

export default ResponseRenderer;
