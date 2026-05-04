"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useState } from "react";

type ExperienceItem = {
  role?: string;
  company?: string;
  period?: string;
  highlights?: string[];
  enhancedHighlights?: string[];
};

type ExperienceTestimonialProps = {
  experiences: ExperienceItem[];
};

export const ExperienceTestimonial = ({
  experiences,
}: ExperienceTestimonialProps) => {
  const [active, setActive] = useState(0);

  const testimonials = experiences.map((exp) => ({
    name: exp.role || "Unknown Role",
    designation: `${exp.company || "Unknown Company"} • ${
      exp.period || "Unknown Period"
    }`,
    // Use AI-enhanced highlights if available, otherwise use original
    highlights: exp.enhancedHighlights || exp.highlights || [],
  }));

  const handleNext = () =>
    setActive((prev) => (prev + 1) % testimonials.length);
  const handlePrev = () =>
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[active];

  const cleanLine = (line: string) => {
    return line
      .replace(/[*_~`]/g, "")
      .replace(/^\d+\.\s*/, "")
      .replace(/\|/g, "")
      .trim();
  };

  return (
    <div className="mx-auto max-w-4xl px-10 py-12 font-sans antialiased rounded-3xl" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", color: "#0f172a" }}>
      <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: "#0f172a" }}>Experience</h3>

      <div className="flex flex-col justify-between py-2 w-full max-w-[800px] mx-auto">
        <motion.div
          key={active}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Role & Company */}
          <h3 className="text-2xl font-semibold mb-1" style={{ color: "#0f172a" }}>{current.name}</h3>
          <p className="text-md mb-4" style={{ color: "rgba(15,23,42,0.6)" }}>{current.designation}</p>

          {/* Key Contributions */}
          {current.highlights && current.highlights.length > 0 && (
            <motion.div
              className="space-y-2 text-lg leading-snug mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h4 className="text-xl font-semibold mb-2" style={{ color: "rgba(15,23,42,0.85)" }}>Key Contributions</h4>
              {current.highlights.map((highlight, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 mt-2"></span>
                  <p style={{ color: "rgba(15,23,42,0.75)" }}>{cleanLine(highlight)}</p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Navigation */}
        {testimonials.length > 1 && (
          <div className="flex gap-4 pt-8 justify-center">
            <button
              onClick={handlePrev}
              className="group/button flex h-9 w-9 items-center justify-center rounded-full transition" style={{ background: "rgba(15,23,42,0.08)", border: "1px solid rgba(15,23,42,0.2)" }}
              aria-label="Previous Experience"
            >
              <motion.div
                whileHover={{
                  rotate: [0, -15, 15, -10, 10, 0],
                  transition: { duration: 0.6 },
                }}
              >
                <IconArrowLeft className="h-5 w-5" style={{ color: "#0f172a" }} />
              </motion.div>
            </button>
            <button
              onClick={handleNext}
              className="group/button flex h-9 w-9 items-center justify-center rounded-full transition" style={{ background: "rgba(15,23,42,0.08)", border: "1px solid rgba(15,23,42,0.2)" }}
              aria-label="Next Experience"
            >
              <motion.div
                whileHover={{
                  rotate: [0, 15, -15, 10, -10, 0],
                  transition: { duration: 0.6 },
                }}
              >
                <IconArrowRight className="h-5 w-5" style={{ color: "#0f172a" }} />
              </motion.div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
