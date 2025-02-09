import { useRef, useState } from "react";
import { toSnakeCase } from "~/utils/transformers";
import { useFetchStream } from "./useFetchStream";

const DEFAULT_URL = "http://0.0.0.0:8002/api/v1/rag/query";
// const DEFAULT_URL = "http://0.0.0.0:8002/api/v1/rag/sample-stream";

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
  withHierarchy: false,
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
      streamIdRef.current = runStream(
        toSnakeCase({
          query,
          ...options,
        })
      );
    }
  };

  const cancel = () => {
    console.log("streamId:", streamIdRef.current);
    cancelStream(streamIdRef.current);
  };

  return { run, cancel, ...streamState };
};
