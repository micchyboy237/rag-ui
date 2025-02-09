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

  const processRequest = async ({
    requestData,
    controller,
  }: {
    requestData: RequestData;
    controller: AbortController;
  }) => {
    setLoading(true);
    setDone(false);
    setError(null);
    setResponseChunks([]);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Transfer-Encoding": "chunked",
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("ReadableStream not supported");

      while (true) {
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

  const run = (requestData: RequestData): string => {
    return fetchStreamQueue.add(requestData, processRequest);
  };

  const cancel = (id?: string) => {
    if (id) {
      fetchStreamQueue.cancelById(id);
    } else {
      // fetchStreamQueue.cancelCurrent()
      fetchStreamQueue.cancelAll();
    }
  };

  console.log("fetchStreamQueue:", fetchStreamQueue);

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
