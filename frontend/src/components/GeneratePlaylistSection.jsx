import React from 'react';

export function GeneratePlaylistSection({ selectedMood, setSelectedMood, handleGeneratePlaylist, isGenerating }) {
  const moods = ['Happy', 'Sad', 'Party', 'Chill', 'Peace'];

  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 rounded-xl p-6 shadow-lg border border-white/20">
      <h2 className="text-xl font-semibold mb-4">Select Your Mood</h2>
      
      <div className="flex space-x-2">
        {moods.map((mood) => (
          <button
            key={mood}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
              selectedMood === mood
                ? 'bg-pink-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setSelectedMood(mood)}
          >
            {mood}
          </button>
        ))}
      </div>

      <button
        className="mt-6 px-6 py-3 w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
        onClick={handleGeneratePlaylist}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "🎶 Generate Playlist"}
      </button>
    </div>
  );
}
