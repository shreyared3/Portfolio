export const apiService = {
  async sendChatMessage(message: string, conversationId?: string) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, conversationId }),
      credentials: "include",
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 429) {
        const resetTime = errorData.resetTime
          ? new Date(errorData.resetTime).toLocaleTimeString()
          : "later";
        throw new Error(
          errorData.message ||
            `You've explored quite a bit! Please come back after ${resetTime} for more questions. 😊`
        );
      }

      if (res.status === 503) {
        throw new Error(
          errorData.message ||
            "The AI service is a little busy right now. Please wait a few seconds and try again. 🙏"
        );
      }

      throw new Error(errorData.error || "Something went wrong. Please try again.");
    }
    return res.json();
  },
};

export type ChatResponse = {
  success: boolean;
  conversationId: string;
  response: {
    id: string;
    content: string;
    type: string;
    data?: any;
    timestamp: string;
    aiGenerated?: boolean;
  };
};
