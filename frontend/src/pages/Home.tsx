import React from "react";
import { AnimatePresence } from "framer-motion";
import HomeHeader from "../components/home/HomeHeader";
import HomeMain from "../components/home/HomeMain";
import HomeInput from "../components/home/HomeInput";
import QuickActions from "../components/QuickActions";
import { useHome } from "../hooks/useHome";
import { HomeProps } from "../types/home";

const Home: React.FC<HomeProps> = ({ onSwitchToChat }) => {
  const {
    inputValue,
    setInputValue,
    showHeader,
    setIsModalOpen,
    handleSendMessage,
    handleKeyPress,
    handleActionClick,
  } = useHome();

  const handleSend = () => handleSendMessage(onSwitchToChat);
  const handleKeyDown = (e: React.KeyboardEvent) =>
    handleKeyPress(e, onSwitchToChat);
  const handleAction = (question: string) =>
    handleActionClick(question, onSwitchToChat);

  return (
    <div
      className="home-container"
      style={{
        minHeight: "100vh",
        padding: 12,
        borderRadius: 16,
        background: "#bcd7ef",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative glow blobs */}
      <div style={{ position: "absolute", top: -120, left: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: -100, right: -100, width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", top: "40%", left: "55%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none", zIndex: 1 }} />

      <div
        className="home-content"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          minHeight: "calc(100vh - 24px)",
          borderRadius: 12,
          position: "relative",
          zIndex: 10,
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Header */}
        <AnimatePresence>
          {showHeader && (
            <HomeHeader
              showHeader={showHeader}
              onModalStateChange={setIsModalOpen}
            />
          )}
        </AnimatePresence>
        <HomeMain />
        {/* Input Section (chat-like) */}
        <HomeInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSend}
          onKeyPress={handleKeyDown}
        />
        {/* Quick Actions (inline, like Chat) */}
        <div style={{ paddingTop: 8, paddingBottom: 8 }}>
          <QuickActions
            actions={undefined as any}
            onActionClick={handleAction}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
