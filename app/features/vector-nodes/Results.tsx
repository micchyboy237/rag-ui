// app/features/vector-nodes/Results.tsx
import React from "react";

interface ResultsProps {
  data: Array<{ id: string; name: string }>;
  loading: boolean;
  error: Error | null;
}

export const Results: React.FC<ResultsProps> = ({ data, loading, error }) => {
  const data_json_str = JSON.stringify(data, null, 2);

  return (
    <div className="mt-4 p-6 border rounded-lg shadow-md bg-white">
      {loading && (
        <div className="text-center text-blue-500">Loading results...</div>
      )}
      {error && <div className="text-center text-red-500">{error.message}</div>}
      {!loading && !error && data.length === 0 && (
        <div className="text-center text-gray-500">No results found.</div>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="overflow-auto max-h-96">
          <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 font-mono">
            {data_json_str}
          </pre>
        </div>
      )}
    </div>
  );
};
