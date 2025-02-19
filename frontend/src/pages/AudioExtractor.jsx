import React, { useState } from "react";
import axios from "axios";

const AudioExtractor = () => {
  const [file, setFile] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setResponseText("");

    try {
      // Upload file to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default"); // Replace with your actual preset name
      let videoUrl ;
      try {
        const cloudinaryResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/dno2u9uqa/video/upload", // Replace with your Cloudinary cloud name
          formData
        );
        videoUrl = cloudinaryResponse.data.secure_url;
        // console.log(videoUrl);
      } catch (err) {
        console.error("Cloudinary Upload Error:", err.response?.data || err.message);
      }
      
      
      const audioUrl = videoUrl.replace(/mp4$/, "mp3");


      // Pass Cloudinary URL to backend
      const backendResponse = await axios.post("http://localhost:5000/convert-audio-to-text", {
        audioUrl,
      });
      setResponseText(backendResponse.data.transcription || "No text extracted.");
      
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-cover bg-center"
  style={{ backgroundImage: "url('/wallpaper/wall.jpg')" }}
>
  {/* Input Section */}
  <div className="bg-white/30 backdrop-blur-lg rounded-lg shadow-xl p-6 space-y-6 w-full sm:w-[80%] md:w-[65%]">
    <h1 className="text-2xl font-bold text-center text-white uppercase">
      Audio Extractor from Video File
    </h1>
    <div className="space-y-4">
      <label
        htmlFor="fileInput"
        className="block text-lg font-medium text-white"
      >
        Upload Audio or Video File:
      </label>
      <input
        type="file"
        id="fileInput"
        accept="audio/*,video/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow duration-200 shadow-md"
      />
      <button
        onClick={handleFileUpload}
        className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-md ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        }`}
        disabled={loading}
      >
        {loading ? "Processing..." : "Upload and Extract Text"}
      </button>
    </div>
    {responseText && (
      <div className="mt-5 p-4 bg-green-100 border border-green-300 rounded-lg shadow-inner">
        <strong className="block font-semibold text-green-800 mb-2">
          Extracted Text:
        </strong>
        <p className="text-gray-700">{responseText}</p>
      </div>
    )}
    {error && (
      <div className="mt-5 p-4 bg-red-100 border border-red-300 rounded-lg shadow-inner">
        <strong className="block font-semibold text-red-800 mb-2">Error:</strong>
        <p className="text-red-700">{error}</p>
      </div>
    )}
  </div>
</div>


  );
};

export default AudioExtractor;
