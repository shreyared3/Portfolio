import React from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { ChatInputProps } from "../../types/chat";
import { CHAT_CONFIG } from "../../constants/chat";

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isLoading,
  disabled = false,
}) => {
  const isDisabled = !inputValue.trim() || isLoading || disabled;

  return (
    <motion.div
      className="chat-input-container"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 50,
        padding: "8px 12px",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
        maxWidth: "100%",
        width: "80%",
        margin: "0 auto",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <textarea
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyPress}
        rows={1}
        disabled={disabled}
        className="chat-textarea"
        style={{
          resize: "none",
          width: "100%",
          background: "transparent",
          outline: "none",
          color: "#0f172a",
          fontSize: 14,
          cursor: disabled ? "not-allowed" : "text",
        }}
        placeholder={disabled ? "Rate limit reached" : CHAT_CONFIG.placeholder}
      />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSendMessage}
        disabled={isDisabled}
        className={`send-button ${isDisabled ? "send-button-disabled" : "send-button-enabled"}`}
        style={{
          padding: 8,
          borderRadius: "50%",
          transition: "all 0.2s ease",
          cursor: isDisabled ? "not-allowed" : "pointer",
          background: isDisabled ? "rgba(255,255,255,0.08)" : "rgba(139,92,246,0.75)",
          color: isDisabled ? "rgba(255,255,255,0.25)" : "#ffffff",
          border: isDisabled ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(139,92,246,0.5)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Send className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};

export default ChatInput;
