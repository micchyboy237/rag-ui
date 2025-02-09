import { useState } from "react";
import { fetchStreamQueue, FetchStreamQueueType } from "./fetchStreamQueue";

type RequestData = { [key: string]: any };

type UseFetchStream = {
  run: (requestData: RequestData) => string;
  cancel: (id?: string) => void;
  data: string;
  rawData: string[];
  loading: boolean;
  done: boolean;
  error: Error | null;
  queue: FetchStreamQueueType;
};

export const useFetchStream = (url: string): UseFetchStream => {
  const [responseChunks, setResponseChunks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const processRequest = (item: { requestData: RequestData; id: string }) => {
    setLoading(true);
    setDone(false);
    setError(null);
    setResponseChunks([]);

    const queryParams = new URLSearchParams(item.requestData).toString();
    const eventSource = new EventSource(`${url}?${queryParams}`);

    fetchStreamQueue["running"].eventSource = eventSource;

    eventSource.onmessage = (event: MessageEvent) => {
      setResponseChunks((prevChunks) => [...prevChunks, event.data]);
    };

    eventSource.onerror = () => {
      console.error("Error on eventSource");
      eventSource.close();
      setLoading(false);
      setDone(true);
    };
  };

  const run = (requestData: RequestData): string => {
    return fetchStreamQueue.add(requestData, processRequest);
  };

  const cancel = async (id?: string) => {
    if (id) {
      fetchStreamQueue.cancelById(id);
    } else {
      fetchStreamQueue.cancelAll();
    }

    setLoading(false);

    // Send stop request to backend
    try {
      const response = await fetch(
        "http://0.0.0.0:8002/api/v1/rag/query/stop",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // body: JSON.stringify({ id }),
        }
      );
      console.info("Cancelled stream:", response);
    } catch (error) {
      console.error("Failed to send stop request:", error);
    }
  };

  return {
    run,
    cancel,
    data: responseChunks.join(""),
    rawData: responseChunks,
    loading,
    done,
    error,
    queue: fetchStreamQueue,
  };
};
