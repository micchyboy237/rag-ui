import { useEffect, useState } from "react";

const useSSE = (url) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      setData((prevData) => [...prevData, event.data]);
    };

    eventSource.onerror = (err) => {
      setError("Connection error");
      eventSource.close();
    };

    return () => eventSource.close();
  }, [url]);

  return { data, error };
};

export default useSSE;
