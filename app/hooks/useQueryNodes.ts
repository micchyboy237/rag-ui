import { useState } from "react";
import { toSnakeCase } from "~/utils/transformers";

const DEFAULT_OPTIONS = {
  withHierarchy: true,
  topK: 20,
  chunkSize: 1024,
  chunkOverlap: 100,
  subChunkSizes: [512, 256, 128],
  mode: "hierarchy",
};

type QueryOptions = typeof DEFAULT_OPTIONS;
type QueryNodesHook = {
  run: (query: string, options?: Partial<QueryOptions>) => void;
  cancel: () => void;
  data: any[];
  loading: boolean;
  error: Error | null;
};

type Options = Partial<QueryOptions>;

export const useQueryNodes = (): QueryNodesHook => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);

  const fetchNodes = async (query: string, options?: Options) => {
    setLoading(true);
    setError(null);
    const abortController = new AbortController();
    setController(abortController);
    try {
      const finalOptions = { ...DEFAULT_OPTIONS, ...options };
      const snakeCasedOptions = toSnakeCase(finalOptions);
      const response = await fetch("http://0.0.0.0:8002/api/v1/rag/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          ...snakeCasedOptions,
        }),
        signal: abortController.signal,
      });
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err);
        console.error(err);
      } else {
        console.info(err);
      }
    } finally {
      setLoading(false);
      setController(null);
    }
  };

  const run = (query: string, options?: Options) => {
    if (query) fetchNodes(query, options);
  };
  const cancel = () => {
    if (controller) {
      controller.abort();
      setLoading(false);
      setError(new Error("Request cancelled"));
    }
  };

  return { run, cancel, data, loading, error };
};
