import React, { useState, useRef } from "react";
import { Loader, Send } from "lucide-react";
import axios from "axios";

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messageEndRef = useRef(null);

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios("http://localhost:5000/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputValue,        // Value entered by the user
          inputType: "text", // Assuming it's a text input, you can modify this as needed
          outputType: "json", // Assuming you want the output as JSON
          stream: false,     // Assuming no streaming, modify based on your backend needs
        }),
      });

      console.log(response);
      const data = response.data;

      // if (!response.ok) {
      //   throw new Error(data.error || "Failed to get a response.");
      // }

      // Assuming the response contains a 'response' field
      setChatHistory([
        ...chatHistory,
        { prompt: inputValue, response: data.output },  // Modify this based on your actual response structure
      ]);
      setInputValue("");
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError("Failed to get a response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (response) => response;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/wallpaper/wall.jpg')" }}
    >
      {/* Chat History */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto w-full sm:w-[80%] md:w-[65%] bg-white/30 backdrop-blur-lg rounded-lg shadow-xl p-6 leading-relaxed mt-4 sm:mt-8">
        <h2 className="text-white text-xl font-bold border-b-2 border-white/50 pb-2 mb-4">
          Chat History
        </h2>
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className="bg-gray-900/40 backdrop-blur-md p-4 rounded-lg shadow-md border border-gray-500"
          >
            {/* User Message */}
            <div className="bg-teal-600/30 text-white rounded-md w-full sm:w-[90%] p-3 mb-2">
              <p className="font-semibold">You:</p>
              <p className="whitespace-pre-wrap">{chat.prompt}</p>
            </div>
            {/* Response Message */}
            <div className="flex justify-end mt-2">
              <div className="bg-teal-600/30 text-white w-full sm:w-[90%] rounded-md p-3">
                <p className="font-semibold">Response:</p>
                <pre className="whitespace-pre-wrap leading-relaxed text-white/80 font-mono overflow-auto">
                  {formatResponse(chat.response)}
                </pre>
              </div>
            </div>
          </div>
        ))}
        {/* Invisible element to scroll into view */}
        <div ref={messageEndRef} />
      </div>

      {/* Input Section */}
      <div className="bg-white/30 backdrop-blur-lg rounded-lg shadow-xl p-6 space-y-6 w-full sm:w-[80%] md:w-[65%] mt-6">
        <h1 className="text-2xl font-bold text-center text-white uppercase">
          Language Translator
        </h1>
        <div className="flex items-center justify-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your message"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-[85%] transition-shadow duration-200 shadow-md"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`p-4 ml-3 rounded-lg font-semibold text-white flex justify-center items-center transition-all duration-200 shadow-md ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            }`}
          >
            {loading ? (
              <Loader className="animate-spin text-xl" />
            ) : (
              <Send className="text-xl" />
            )}
          </button>
        </div>
        {error && <p className="text-red-500 font-medium text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Chatbot;
