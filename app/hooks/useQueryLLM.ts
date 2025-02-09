import { useState } from "react";
import { toSnakeCase } from "~/utils/transformers";

const DEFAULT_OPTIONS = {
  ragDir:
    "/Users/jethroestrada/Desktop/External_Projects/Jet_Projects/JetScripts/data/jet-resume/data",
  extensions: [".md", ".mdx", ".rst"],
  system:
    "You are a job applicant providing tailored responses during an interview.\n" +
    "Always answer questions using the provided context as if it is your resume, " +
    "and avoid referencing the context directly.\n" +
    "Some rules to follow:\n" +
    "1. Never directly mention the context or say 'According to my resume' or similar phrases.\n" +
    "2. Provide responses as if you are the individual described in the context, focusing on professionalism and relevance.",
  chunkSize: 1024,
  chunkOverlap: 40,
  subChunkSizes: [512, 256, 128],
  withHierarchy: true,
  topK: null,
  model: "llama3.2",
  embedModel: "nomic-embed-text",
  mode: "fusion",
  storePath:
    "/Users/jethroestrada/Desktop/External_Projects/Jet_Projects/jet_server/.cache/deeplake/store_1",
  scoreThreshold: 0.0,
  splitMode: [],
  contexts: [],
};

type QueryOptions = typeof DEFAULT_OPTIONS;

type QueryHook = {
  run: (query: string, options?: Partial<QueryOptions>) => void;
  cancel: () => void;
  data: string[];
  loading: boolean;
  error: Error | null;
};

type Options = Partial<QueryOptions>;

export const useQueryLLM = (): QueryHook => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);

  const fetchQuery = async (query: string, options?: Options) => {
    setLoading(true);
    setError(null);
    const abortController = new AbortController();
    setController(abortController);
    try {
      const finalOptions = { ...DEFAULT_OPTIONS, ...options };
      const snakeCasedOptions = toSnakeCase(finalOptions);
      const response = await fetch("http://0.0.0.0:8002/api/v1/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          ...snakeCasedOptions,
        }),
        signal: abortController.signal,
      });
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
      const result = await response.text();
      setData(result.split("\n").filter(Boolean));
    } catch (err: any) {
      if (err.name !== "AbortError") setError(err);
    } finally {
      setLoading(false);
    }
  };

  const run = (query: string, options?: Options) => {
    if (query) fetchQuery(query, options);
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
