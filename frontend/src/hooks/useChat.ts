import { useState, useRef, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { apiService } from "../services/apiService";
import { ChatInteraction } from "../types/chat";

export const useChat = (initialQuery?: string) => {
  const [currentInteraction, setCurrentInteraction] =
    useState<ChatInteraction | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentInteraction, scrollToBottom]);

  const handleSendMessage = useCallback(
    async (message?: string) => {
      if (isRateLimited) return;

      const question = message ?? inputValue;
      if (!question.trim()) return;

      setInputValue("");
      setIsLoading(true);

      const interactionId = Date.now().toString();
      const newInteraction: ChatInteraction = {
        id: interactionId,
        question,
        response: "",
        timestamp: new Date(),
        isLoading: true,
        isStreaming: true,
      };

      setCurrentInteraction(newInteraction);

      let streamedText = "";
      let rafId: number | null = null;

      await apiService.sendChatMessageStream(
        question,
        (chunk) => {
          streamedText += chunk;
          if (rafId === null) {
            rafId = requestAnimationFrame(() => {
              rafId = null;
              const text = streamedText;
              setCurrentInteraction((prev) =>
                prev?.id === interactionId
                  ? { ...prev, response: text, isLoading: true }
                  : prev
              );
            });
          }
        },
        (finalText) => {
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          setCurrentInteraction((prev) =>
            prev?.id === interactionId
              ? { ...prev, response: finalText || streamedText, structured: { type: "general" }, isLoading: false, isStreaming: false }
              : prev
          );
          setIsLoading(false);
        },
        (err) => {
          if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
          const errorMessage = err?.message || "Something went wrong. Please try again.";
          const isHardRateLimit =
            errorMessage.includes("explored quite a bit") ||
            errorMessage.includes("rate limit");
          const isServiceBusy =
            errorMessage.includes("busy right now") ||
            errorMessage.includes("wait a few seconds");

          if (isHardRateLimit) {
            setIsRateLimited(true);
            setRateLimitMessage(errorMessage);
          }

          setCurrentInteraction((prev) =>
            prev?.id === interactionId
              ? {
                  ...prev,
                  response: isServiceBusy ? "⚠️ " + errorMessage : errorMessage,
                  structured: undefined,
                  isLoading: false,
                }
              : prev
          );
          setIsLoading(false);
        }
      );

      // Safety net in case onDone/onError never fires
      setIsLoading(false);
    },
    [inputValue, isRateLimited]
  );

  // Handle initial query only once
  const hasProcessedInitialQuery = useRef(false);

  useEffect(() => {
    if (
      initialQuery &&
      initialQuery.trim() &&
      !hasProcessedInitialQuery.current
    ) {
      hasProcessedInitialQuery.current = true;
      setInputValue(initialQuery);
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]); // Remove handleSendMessage from dependencies

  const handleQuickQuestion = useCallback(
    (question: string) => {
      setInputValue(question);
      handleSendMessage(question);
    },
    [handleSendMessage]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return {
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
  };
};
