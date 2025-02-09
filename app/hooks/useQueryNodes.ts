import { useState } from "react";

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

const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item));
  } else if (obj && typeof obj === "object" && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as Record<string, any>);
  }
  return obj;
};

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
      if (err.name !== "AbortError") setError(err);
    } finally {
      setLoading(false);
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
