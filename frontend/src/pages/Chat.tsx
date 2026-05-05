import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatHeader from "../components/chat/ChatHeader";
import ResponseRenderer from "../components/chat/ResponseRenderer";
import ChatInput from "../components/chat/ChatInput";
import QuickQuestionButtons from "../components/QuickActions";
import HowToUseModal from "../components/HowToUseCardCarousal";
import RateLimitModal from "../components/chat/RateLimitModal";
import { useChat } from "../hooks/useChat";
import { ChatProps } from "../types/chat";
import { CHAT_ANIMATIONS } from "../constants/chat";

const Chat: React.FC<ChatProps> = ({ onBackToHome, initialQuery }) => {
  const [showQuickQuestions] = useState(true);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const {
    currentInteraction,
    inputValue,
    setInputValue,
    isLoading,
    isRateLimited,
    rateLimitMessage,
    messagesEndRef,
    handleSendMessage,
    handleQuickQuestion,
    handleKeyPress,
  } = useChat(initialQuery);

  return (
    <div
      className="chat-container"
      style={{ minHeight: "100vh", position: "relative" }}
    >
      <div
        className="chat-content"
        style={{
          background: "transparent",
          minHeight: "100vh",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <ChatHeader onBackToHome={onBackToHome} />

        {/* Main Content */}
        <main className="chat-main">
          <div
            className="chat-content-wrapper"
            style={{ maxWidth: "64rem", margin: "0 auto" }}
          >
            {/* Single Chat Interaction */}
            <AnimatePresence mode="wait">
              {currentInteraction && (
                <motion.div
                  key={currentInteraction.id}
                  {...CHAT_ANIMATIONS.container}
                  className="chat-interaction"
                  style={{
                    minHeight: "60vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* Question */}
                  <div
                    className="question-container"
                    style={{
                      marginBottom: 32,
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    <p
                      className="question-text"
                      style={{
                        color: "#0f172a",
                        fontWeight: 500,
                        fontSize: 24,
                      }}
                    >
                      {currentInteraction.question}
                    </p>
                  </div>

                  {/* Response */}
                  <ResponseRenderer interaction={currentInteraction} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Input Section */}
            <div className="chat-input-section" style={{ marginTop: 32 }}>
              {/* Quick Questions */}
              <AnimatePresence>
                {showQuickQuestions && (
                  <motion.div
                    key="quick-questions"
                    {...CHAT_ANIMATIONS.quickQuestions}
                  >
                    <QuickQuestionButtons
                      onQuestionClick={handleQuickQuestion}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Input */}
              <ChatInput
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSendMessage={handleSendMessage}
                onKeyPress={handleKeyPress}
                isLoading={isLoading}
                disabled={isRateLimited}
              />
            </div>
          </div>
        </main>

        <AnimatePresence>
          {isHowItWorksOpen && (
            <HowToUseModal
              onModalStateChange={(isOpen: boolean) =>
                setIsHowItWorksOpen(isOpen)
              }
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isRateLimited && <RateLimitModal message={rateLimitMessage} />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Chat;
