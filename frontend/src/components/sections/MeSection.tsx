"use client";

import React from "react";
import { CardContainer, CardBody, CardItem } from "../../components/ui/3d-card";
import { renderBold } from "../../utils/renderBold";

interface MeSectionProps {
  aiText: string;
  containerClassName?: string;
}

const MeSection: React.FC<MeSectionProps> = ({ aiText, containerClassName }) => {
  return (
    <CardContainer containerClassName={containerClassName}>
      <CardBody
        className="shadow-lg rounded-xl p-8 flex flex-col items-center justify-center h-auto w-full max-w-2xl mx-auto"
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
          color: "#0f172a",
        }}
      >
        <CardItem translateZ={15} className="mb-4">
          <h2 className="text-3xl font-bold text-center" style={{ color: "#0f172a" }}>
            About Me
          </h2>
        </CardItem>
        <CardItem translateZ={10}>
          <p className="text-lg leading-relaxed text-center whitespace-pre-line" style={{ color: "rgba(15,23,42,0.8)" }}>
            {renderBold(aiText)}
          </p>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
};

export default MeSection;
