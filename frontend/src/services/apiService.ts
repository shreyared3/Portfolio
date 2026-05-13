export const apiService = {
  async sendChatMessageStream(
    message: string,
    onChunk: (chunk: string) => void,
    onDone: (finalText: string) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    let res: Response;
    try {
      res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        credentials: "include",
      });
    } catch (err: any) {
      onError(new Error("Network error. Please check your connection."));
      return;
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (res.status === 429) {
        const resetTime = errorData.resetTime
          ? new Date(errorData.resetTime).toLocaleTimeString()
          : "later";
        onError(new Error(errorData.message || `You've explored quite a bit! Please come back after ${resetTime} for more questions. 😊`));
      } else if (res.status === 503) {
        onError(new Error(errorData.message || "The AI service is a little busy right now. Please wait a few seconds and try again. 🙏"));
      } else {
        onError(new Error(errorData.error || "Something went wrong. Please try again."));
      }
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop()!;

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "chunk") onChunk(event.content);
            else if (event.type === "done") onDone(event.finalText ?? "");
            else if (event.type === "error") {
              const isOverloaded = event.code === "service_overloaded";
              onError(new Error(isOverloaded ? event.message : event.message));
            }
          } catch {}
        }
      }
    } catch (err: any) {
      onError(new Error("Stream interrupted. Please try again."));
    }
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
