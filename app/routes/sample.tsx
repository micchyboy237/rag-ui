import { useState, useEffect, useRef, useCallback } from "react";

interface StreamResponse {
  data: string;
}

interface UseStreamHook {
  start: (params: Record<string, any>) => void;
  cancel: () => void;
  messages: string[];
  isStreaming: boolean;
}

export const useSampleStream = (url: string): UseStreamHook => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const start = useCallback(
    (params: Record<string, any>) => {
      if (isStreaming) return;

      setMessages([]);
      setIsStreaming(true);

      const eventSource = new EventSource(url, { withCredentials: false });
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event: MessageEvent) => {
        setMessages((prev) => [...prev, event.data]);
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsStreaming(false);
      };
    },
    [isStreaming, url]
  );

  const cancel = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return { start, cancel, messages, isStreaming };
};

// Usage example in a React component
const MyComponent = () => {
  const { start, cancel, messages, isStreaming } = useSampleStream(
    "http://0.0.0.0:8002/api/v1/rag/sample-stream"
  );

  return (
    <div>
      <button
        onClick={() => start({ thread_id: "123" })}
        disabled={isStreaming}
      >
        Start Streaming
      </button>
      <button onClick={cancel} disabled={!isStreaming}>
        Cancel
      </button>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
};

export default MyComponent;
