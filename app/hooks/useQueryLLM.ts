import { useRef } from "react";
import { toSnakeCase } from "~/utils/transformers";
import { useFetchStream } from "./useFetchStream";
import { DEFAULT_OPTIONS, DEFAULT_URL } from "./config";

type QueryOptions = typeof DEFAULT_OPTIONS;

type UseQueryLLM = {
  run: (query: string, options?: Partial<QueryOptions>) => void;
  cancel: () => void;
  data: string;
  rawData: string[];
  loading: boolean;
  done: boolean;
  error: Error | null;
};

export const useQueryLLM = (url: string = DEFAULT_URL): UseQueryLLM => {
  const {
    run: runStream,
    cancel: cancelStream,
    ...streamState
  } = useFetchStream(url);
  const streamIdRef = useRef(null);

  const run = (query: string, options?: Partial<QueryOptions>) => {
    if (query) {
      const requestData = toSnakeCase({
        query,
        ...options,
      });
      streamIdRef.current = runStream(requestData);
    }
  };

  const cancel = () => {
    console.log("streamId:", streamIdRef.current);
    cancelStream(streamIdRef.current);
  };

  return { run, cancel, ...streamState };
};
