import { Filter, QueryOptions } from "./types";

export const DEFAULT_FILTERS: QueryOptions = {
  query: "",
  rag_dir:
    "/Users/jethroestrada/Desktop/External_Projects/Jet_Projects/JetScripts/data/jet-resume/data",
  extensions: [".md", ".mdx", ".rst"],
  system: `You are a job applicant providing tailored responses during an interview.
  Always answer questions using the provided context as if it is your resume, 
  and avoid referencing the context directly.
  Some rules to follow:
  1. Never directly mention the context or say 'According to my resume' or similar phrases.
  2. Provide responses as if you are the individual described in the context, focusing on professionalism and relevance.`,
  chunk_size: 1024,
  chunk_overlap: 100,
  sub_chunk_sizes: [512, 256, 128],
  with_hierarchy: false,
  top_k: null,
  model: "llama3.2",
  embed_model: "mxbai-embed-large",
  mode: "fusion",
  store_path:
    "/Users/jethroestrada/Desktop/External_Projects/Jet_Projects/jet_server/.cache/deeplake/store_1",
  score_threshold: 0.0,
  split_mode: [],
};

export const DEFAULT_FILTER_OPTIONS: Array<Filter> = [
  {
    name: "RAG Directory",
    key: "rag_dir",
    type: "text",
    placeholder: "Enter RAG directory path",
  },
  {
    name: "File Extensions",
    key: "extensions",
    type: "text",
    placeholder: "Enter file extensions",
  },
  {
    name: "System Description",
    key: "system",
    type: "text",
    placeholder: "Enter system description",
  },
  {
    name: "Chunk Size",
    key: "chunk_size",
    type: "number",
    placeholder: "Select chunk size",
  },
  {
    name: "Chunk Overlap",
    key: "chunk_overlap",
    type: "number",
    placeholder: "Select chunk overlap",
  },
  {
    name: "Sub Chunk Sizes",
    key: "sub_chunk_sizes",
    type: "list",
    placeholder: "Enter sub chunk sizes",
    options: [512, 256, 128],
  },
  {
    name: "With Hierarchy",
    key: "with_hierarchy",
    type: "boolean",
    placeholder: "Enable hierarchy",
  },
  {
    name: "Top K",
    key: "top_k",
    type: "number",
    placeholder: "Select top K results",
  },
  {
    name: "Model",
    key: "model",
    type: "text",
    placeholder: "Enter model name",
  },
  {
    name: "Embed Model",
    key: "embed_model",
    type: "text",
    placeholder: "Enter embed model name",
  },
  {
    name: "Mode",
    key: "mode",
    type: "select",
    placeholder: "Enter mode",
    options: ["fusion", "hierarchy", "deeplake", "faiss", "graph_nx"],
  },
  {
    name: "Store Path",
    key: "store_path",
    type: "text",
    placeholder: "Enter store path",
  },
  {
    name: "Score Threshold",
    key: "score_threshold",
    type: "number",
    placeholder: "Set score threshold",
  },
  {
    name: "Split Mode",
    key: "split_mode",
    type: "checkbox",
    placeholder: "Select split modes",
    options: ["markdown", "hierarchy"],
  },
];

DEFAULT_FILTER_OPTIONS.map((item) => (item.value = DEFAULT_FILTERS[item.key]));
