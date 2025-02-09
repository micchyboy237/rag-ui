import { useEffect, useRef, useState } from "react";

const StreamStatus = {
  pending: "pending",
  loading: "loading",
  done: "done",
  stopped: "stopped",
  error: "error",
};

export const useFetchStream = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(StreamStatus.pending);
  let controller = useRef(null);

  const fetchEventStream = (url, body) => {
    setLoading(true);
    setError(null);
    setStatus(StreamStatus.loading);

    controller.current = new AbortController();
    const signal = controller.current.signal;

    fetch(url, {
      method: "POST",
      signal: signal,
      headers: {
        "Content-Type": "application/json", // Set the content type header
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const reader = response.body.getReader();

        const streamReader = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                setStatus(StreamStatus.done);
                setLoading(false);
                return;
              }
              let text = new TextDecoder().decode(value);
              let messages = [];

              if (text.startsWith("data:")) {
                // Replace all "newline" with "\n"
                text = text.replace(/newline/g, "\n");
                // Get all messages after "data:"
                messages = text.split("data:");
                // Remove first element
                messages = messages.slice(1);
                // Add all messages to the data array
                messages.forEach((message) => {
                  setData((prevData) => [...prevData, message]);
                });
                streamReader();
              } else if (text.startsWith("stop")) {
                console.log("Stopping stream...");
                setStatus(StreamStatus.done);
                setLoading(false);
                return;
              }

              //   setData((prevData) => [...prevData, text || '\n']);
              //   streamReader();
            })
            .catch((error) => {
              console.error("Error reading response body:", error);
              setLoading(false);
              setStatus(StreamStatus.error);
              setError(new Error("Stream ended unexpectedly."));
            });
        };

        streamReader();
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setLoading(false);
        setStatus(StreamStatus.error);
        setError(new Error("Failed to fetch data from the server."));
      });
  };

  const stopEventStream = () => {
    if (controller.current) {
      controller.current.abort();
      setStatus(StreamStatus.stopped);
      setLoading(false);
    }
  };

  const runEventStream = (url, body) => {
    clearData();
    fetchEventStream(url, body);
  };

  const clearData = () => {
    stopEventStream();
    setData([]);
    setStatus(StreamStatus.pending);
    setError(null);
  };

  useEffect(() => {
    return () => {
      stopEventStream();
    };
  }, []);

  return {
    loading,
    data: data.join(""),
    rawData: data,
    error,
    status,
    run: runEventStream,
    stop: stopEventStream,
    clear: clearData,
  };
};
