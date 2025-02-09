import React, { useEffect, useState, useRef } from "react";

const ChatText = ({ children, className }) => {
  return (
    <p
      className={className}
      style={{
        whiteSpace: "pre-line",
        fontSize: "14px",
        lineHeight: "1.5",
      }}
      dangerouslySetInnerHTML={{
        __html: children.trim(),
      }}
    />
  );
};

const generationConfig = {
  //   temperature: 0.8,
  //   top_k: 10
  model: "llama3.1",
};

const SampleChatbot = () => {
  const [prompt, setPrompt] = useState("Why is the sky blue?");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [chats, setChats] = useState([]);

  const [generate, { data: text, error, loading, clear, stop }] = useChat();

  // const { run, ...streamState } = useStreamingApi(SAMPLE_STREAM_GENERATE);
  // console.log('streamState:', streamState);
  // useEffect(() => {
  //   run();
  // }, []);

  return (
    <div id="chatbot">
      <div
        className="bg-white border rounded shadow-lg"
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          borderRadius: "10px",
          //   border: '1px solid #e0e0e0',
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* <AutoResizingTextarea
              className="prompt-textarea"
              placeholder="Summarize your skills and experience."
              value={prompt}
              onChangeValue={setPrompt}
            /> */}
        <div id="chatbox">
          <div id="chatbox_header">
            <p
              style={{
                marginBottom: 0,
              }}
            >
              Chatbot
            </p>
          </div>
          <div id="chatbox_body">
            {chats.map((chat, i) => (
              <div key={i}>
                <p className="chat-prompt">{chat.prompt}</p>
                <ChatText className="chat-text">{chat.text}</ChatText>
              </div>
            ))}
            {currentPrompt && (
              <div key={chats.length - 1}>
                <p className="chat-prompt">{currentPrompt}</p>
                <ChatText className="chat-text">{text}</ChatText>
              </div>
            )}
          </div>

          <div id="chatbox_footer">
            <input
              required
              type="text"
              placeholder="Ask me anything!"
              defaultValue=""
              value={prompt}
              id="chatbar"
              onChange={(e) => setPrompt(e.target.value)}
              //   Send with Enter
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentPrompt(prompt);
                  // Remove chats with empty text
                  setChats((prev) => prev.filter((chat) => chat.text));
                  if (text) {
                    setChats((prev) => [
                      ...prev,
                      { prompt: currentPrompt, text },
                    ]);
                  }
                  setTimeout(() => {
                    generate(prompt, generationConfig);
                    setPrompt("");
                  }, 0);
                }
              }}
            />

            <div
              style={{
                // position: 'absolute',
                // right: 12,
                // top: 8,
                // bottom: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              {!loading ? (
                <button
                  className="submit"
                  onClick={() => {
                    setCurrentPrompt(prompt);
                    // Remove chats with empty text
                    setChats((prev) => prev.filter((chat) => chat.text));
                    if (text) {
                      setChats((prev) => [
                        ...prev,
                        { prompt: currentPrompt, text },
                      ]);
                    }
                    setTimeout(() => {
                      generate(prompt, generationConfig);
                      setPrompt("");
                    }, 0);
                  }}
                >
                  <i className="fa fa-envelope"></i>
                </button>
              ) : (
                <button className="stop" onClick={() => stop()}>
                  <i className="fa fa-phone"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* <div
          style={{
            flexDirection: 'row',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <button
            className="clear"
            disabled={loading}
            onClick={() => {
              clear();
              setChats([]);
              setPrompt('');
              setCurrentPrompt('');
            }}
          >
            Clear
          </button>
        </div> */}
      </div>
    </div>
  );
};

const host = "http://localhost:11434";

export const API_URL_MODELS_GENERATE = `${host}/api/chat`;
export const SAMPLE_STREAM_GENERATE = `http://localhost:8000/api/threads/test-thread/runs/stream`;

export const generateUrl = ({
  origin,
  pathName = "", // Initialize to empty string by default
  pathParams = {},
  params = {},
}) => {
  // Combine origin and pathName for the full path template
  const fullPathTemplate = `${origin}${pathName ? `/${pathName}` : ""}`;

  // Replace placeholders in the path
  let populatedPath = fullPathTemplate;
  for (const [key, value] of Object.entries(pathParams)) {
    if (value !== undefined) {
      // Check for undefined value
      populatedPath = populatedPath.replace(`:${key}`, value);
    }
  }

  const queryString = Object.entries(params)
    .filter(([, value]) => value !== undefined) // Filter out entries with undefined values
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
      }

      return `${key}=${encodeURIComponent(value)}`;
    })
    .join("&");

  // Ensure the populatedPath doesn't end with specific patterns
  populatedPath = trimTrailingPatterns(populatedPath, ["/", "&", "?", "/?"]);

  let finalUrl = `${populatedPath}${queryString ? `?${queryString}` : ""}`;
  finalUrl = trimTrailingPatterns(finalUrl, ["/", "&", "?", "/?"]);

  return finalUrl;
};

// Utility to trim trailing characters and patterns
export const trimTrailingPatterns = (str, patterns = []) => {
  for (const pattern of patterns) {
    if (typeof pattern === "string" && str.endsWith(pattern)) {
      str = str.slice(0, -pattern.length);
    } else if (pattern instanceof RegExp && pattern.test(str)) {
      str = str.replace(pattern, "");
    }
  }
  return str;
};

const useChat = (model, options = {}) => {
  const { run, ...streamState } = useTextStream();

  const generate = (prompt, generationConfig) => {
    const params = {
      model,
      stream: true,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      ...(generationConfig || {}),
    };

    const streamUrl = generateUrl({
      origin: API_URL_MODELS_GENERATE,
      params: params,
    });

    console.log("streamUrl", streamUrl);

    if (streamState.status !== StreamStatus.loading) {
      run(streamUrl);
    }
  };

  return [generate, streamState];
};

const useStreamingApi = (url) => {
  const [responseChunks, setResponseChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const controllerRef = useRef(null); // Reference to the AbortController
  const [streamingActive, setStreamingActive] = useState(true); // Control variable for streaming loop

  const run = async (requestData) => {
    setLoading(true);
    setResponseChunks([]);
    controllerRef.current = new AbortController(); // Create a new AbortController
    const { signal } = controllerRef.current;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Transfer-Encoding": "chunked",
        },
        body: JSON.stringify(requestData),
        signal, // Pass the signal to the fetch request
      });

      const reader = response.body.getReader();

      let chunks = [];

      while (streamingActive) {
        const { done, value } = await reader.read({ signal }); // Pass the signal to reader.read()

        if (done) {
          console.log("Stream complete");
          break;
        }

        const chunkText = new TextDecoder().decode(value);
        const chunkObj = JSON.parse(chunkText);

        chunks.push(chunkObj);

        // Update state with the current chunks
        setResponseChunks((prevChunks) => [...prevChunks, chunkObj]);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error fetching data:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const stop = () => {
    console.log("Stopping stream...");
    setStreamingActive(false); // Update the control variable to stop the streaming loop
    if (controllerRef.current) {
      controllerRef.current.abort(); // Abort the fetch request if it's ongoing
    }
  };

  const clear = () => {
    stop();
    setResponseChunks([]);
  };

  return {
    run,
    stop,
    clear,
    loading,
    done,
    data: responseChunks,
  };
};

const StreamStatus = {
  pending: "pending",
  loading: "loading",
  done: "done",
  stopped: "stopped",
  error: "error",
};

const useTextStream = () => {
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

export default SampleChatbot;
