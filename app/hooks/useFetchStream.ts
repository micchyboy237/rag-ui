import { useState, useRef } from "react";
import { fetchStreamQueue } from "./fetchStreamQueue";

type RequestData = { [key: string]: any };

type UseFetchStream = {
  run: (requestData: RequestData) => void;
  cancel: () => void;
  data: string;
  rawData: string[];
  loading: boolean;
  done: boolean;
  error: Error | null;
};

export const useFetchStream = (url: string): UseFetchStream => {
  const [responseChunks, setResponseChunks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const [streamingActive, setStreamingActive] = useState(true);

  const processRequest = async (requestData: RequestData) => {
    setLoading(true);
    setDone(false);
    setError(null);
    setResponseChunks([]);
    setStreamingActive(true);
    controllerRef.current = new AbortController();
    const { signal } = controllerRef.current;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Transfer-Encoding": "chunked",
        },
        body: JSON.stringify(requestData),
        signal,
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("ReadableStream not supported");

      while (streamingActive) {
        const { done, value } = await reader.read();
        if (done) break;

        const prefix = "data: ";
        let chunk = new TextDecoder().decode(value);
        chunk = chunk.replace(/newline/g, "\n");

        const subChunks = chunk.split(prefix);
        for (let subChunk of subChunks) {
          subChunk = subChunk.replace(/\n{2}$/, "").replace(/\n{3,}$/, "\n");
          if (subChunk) {
            setResponseChunks((prevChunks) => [...prevChunks, subChunk]);
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
      setDone(true);
    }
  };

  const run = (requestData: RequestData) => {
    fetchStreamQueue.add(requestData, processRequest);
  };

  const cancel = () => {
    setStreamingActive(false);
    controllerRef.current?.abort();
    fetchStreamQueue.clear();
  };

  return {
    run,
    cancel,
    data: responseChunks.join(""),
    rawData: responseChunks,
    loading,
    done,
    error,
  };
};
