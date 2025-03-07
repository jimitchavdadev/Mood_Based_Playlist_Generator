import React, { useState } from 'react';
import { VoicePromptInput } from './VoicePromptInput';

export function GeneratePlaylistSection({ selectedMood, setSelectedMood, handleGeneratePlaylist, isGenerating }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customMoods, setCustomMoods] = useState({
    Happy: 50,
    Sad: 50,
    Party: 50,
    Chill: 50,
    Peace: 50
  });
  
  const moods = ['Happy', 'Sad', 'Party', 'Chill', 'Peace'];

  const handleSliderChange = (mood, value) => {
    setCustomMoods({
      ...customMoods,
      [mood]: value
    });
  };

  const handleMoodParametersReceived = (moodParameters) => {
    // Ensure the mood parameters are numeric values
    const numericMoodParameters = {};
    for (const [mood, value] of Object.entries(moodParameters)) {
      numericMoodParameters[mood] = Number(value);
    }
    
    setShowCustom(true); // Switch to custom mode
    setCustomMoods(numericMoodParameters); // Set the mood values from voice input
  };

  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 rounded-xl p-6 shadow-lg border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Select Your Mood</h2>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm">Custom Playlist</span>
          <button 
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${showCustom ? 'bg-pink-500' : 'bg-gray-700'}`}
            onClick={() => setShowCustom(!showCustom)}
          >
            <div className={`bg-white h-4 w-4 rounded-full shadow-md transform transition-transform duration-300 ${showCustom ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>
      
      {!showCustom ? (
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
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg mt-4">
          <p className="text-sm text-gray-300 mb-4">Adjust each mood to create your custom playlist mix:</p>
          
          {moods.map((mood) => (
            <div key={mood} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm">{mood}</span>
                <span className="text-sm">{customMoods[mood] || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={customMoods[mood] || 0}
                onChange={(e) => handleSliderChange(mood, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}

      {/* Voice Prompt Component */}
      <VoicePromptInput 
        onMoodParametersReceived={handleMoodParametersReceived}
        disabled={isGenerating}
      />

      <button
        className="mt-6 px-6 py-3 w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
        onClick={() => handleGeneratePlaylist(showCustom ? customMoods : { [selectedMood]: 100 })}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "🎶 Generate Playlist"}
      </button>
    </div>
  );
}