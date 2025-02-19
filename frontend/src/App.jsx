import React from 'react';
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import AudioExtractor from './pages/AudioExtractor';
import Chatbot from './pages/Chatbot.jsx';
import FileExtractor from './pages/FileExtractor.jsx';

const App = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically
  const location = useLocation(); // Hook to get the current route

  return (
    <div>
      <div className="flex space-x-8 my-6 items-center justify-center">
        {/* Chatbot Button */}
        <button
          onClick={() => navigate("/")} // Use relative path for navigation
          className={`p-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-md ${
            location.pathname === "/" // Highlight button if current route matches
              ? "bg-gradient-to-r from-purple-500 to-purple-600"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          Chatbot
        </button>

        {/* Audio Extractor Button */}
        <button
          onClick={() => navigate("/video")}
          className={`p-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-md ${
            location.pathname === "/video"
              ? "bg-gradient-to-r from-purple-500 to-purple-600"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          Audio Extractor
        </button>

        {/* File Extractor Button */}
        <button
          onClick={() => navigate("/file")}
          className={`p-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-md ${
            location.pathname === "/file"
              ? "bg-gradient-to-r from-purple-500 to-purple-600"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          File Extractor
        </button>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Chatbot />} />
        <Route path="/video" element={<AudioExtractor />} />
        <Route path="/file" element={<FileExtractor />} />
      </Routes>
    </div>
  );
};

export default App;
