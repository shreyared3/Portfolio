"use client";

import React from "react";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

const HomeMain: React.FC = () => {
  return (
    <main className="home-main relative flex items-center justify-center min-h-[70vh] px-4 md:px-8">
      <motion.div
        style={{
          background: "rgba(153, 191, 242, 1)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 24,
          padding: "clamp(20px, 5vw, 48px) clamp(16px, 4vw, 40px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
          maxWidth: 900,
          width: "100%",
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 text-center md:text-left">
          {/* Avatar */}
          <motion.div
            className="home-avatar rounded-full overflow-hidden flex-shrink-0"
            style={{
              width: "clamp(120px, 30vw, 200px)",
              height: "clamp(120px, 30vw, 200px)",
              boxShadow: "0 0 0 4px rgba(255,255,255,0.15), 0 0 0 8px rgba(139,92,246,0.2), 0 16px 48px rgba(0,0,0,0.4)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src="/Shreya.jpg"
              alt="Formal Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>

          {/* Text */}
          <div className="text-section max-w-lg">
            <motion.p
              className="text-2xl md:text-3xl font-semibold mb-2 flex items-center justify-center md:justify-start"
              style={{ color: "#0f172a" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="mr-2">
                <Typewriter
                  words={["👋 Hi,", "👋 Bonjour,", "👋 Hallo,"]}
                  loop
                  cursor={false}
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1500}
                />
              </span>
              I'm Shreya
            </motion.p>

            <motion.h1
              className="home-title text-4xl md:text-6xl font-extrabold mb-4"
              style={{ color: "#0f172a", WebkitTextFillColor: "#0f172a" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              AI Portfolio
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl mb-6"
              style={{ color: "#0f172a" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Crafting intelligent web experiences & AI-powered dashboards.
            </motion.p>

            <motion.div
              className="flex gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <a
                href="/Shreya_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn"
              >
                Download Resume
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default HomeMain;
