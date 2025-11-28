import React, { useState, useEffect } from 'react';

const StartupScreen = ({ onStart }) => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [customFile, setCustomFile] = useState(null);

  useEffect(() => {
    // Load videos from assets
    const glob = import.meta.glob('../assets/videos/*.mp4', { eager: true });
    const videoList = Object.keys(glob).map((key) => {
      return {
        src: glob[key].default,
        name: key.split('/').pop(),
      };
    });
    setVideos(videoList);
    if (videoList.length > 0) {
      setSelectedVideo(videoList[0].src);
    }
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomFile({ src: url, name: file.name });
      setSelectedVideo(url);
    }
  };

  const handleStart = () => {
    if (selectedVideo) {
      onStart(selectedVideo, rows, cols);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Video Puzzle Setup
      </h1>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Video Selection */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col h-full min-h-[500px]">
          <h2 className="text-2xl font-semibold mb-4">Select Video</h2>

          <div className="grid grid-cols-2 gap-4 mb-4 overflow-y-auto flex-1 custom-scrollbar">
            {videos.map((video) => (
              <div
                key={video.src}
                onClick={() => {
                  setSelectedVideo(video.src);
                  setCustomFile(null);
                }}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedVideo === video.src ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-500'
                  }`}
              >
                <video src={video.src} className="w-full h-24 object-cover pointer-events-none" />
                <div className="text-xs p-2 bg-black/50 truncate">{video.name}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Or Upload Your Own</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                cursor-pointer"
            />
          </div>
        </div>

        {/* Game Configuration */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Configuration</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Grid Rows: {rows}</label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Grid Columns: {cols}</label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={cols}
                  onChange={(e) => setCols(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <div className="w-full max-w-md bg-black rounded-lg overflow-hidden border border-gray-600 relative shadow-2xl">
              {selectedVideo ? (
                <video
                  src={selectedVideo}
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500">No Video Selected</div>
              )}
              <div className="absolute inset-0 grid pointer-events-none" style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`
              }}>
                {Array.from({ length: rows * cols }).map((_, i) => (
                  <div key={i} className="border border-white/30"></div>
                ))}
              </div>
            </div>
            <p className="text-center text-gray-400 text-sm mt-2">Preview ({rows}x{cols})</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!selectedVideo}
        className="mt-12 px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-xl font-bold shadow-lg 
        hover:scale-105 hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Start Game
      </button>
    </div>
  );
};

export default StartupScreen;
