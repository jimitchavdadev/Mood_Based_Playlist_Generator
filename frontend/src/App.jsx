import React, { useState } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { WaveformBackground } from './components/WaveformBackground';
import { Music2 } from 'lucide-react';
import { GeneratePlaylistSection } from './components/GeneratePlaylistSection';
import { GeneratedPlaylistSection } from './components/GeneratedPlaylistSection';
import './styles/globals.css';
import axios from 'axios';

// Import the enhanced MusicPlayer component
import { MusicPlayer } from './components/MusicPlayer';

function App() {
  const [selectedMood, setSelectedMood] = useState('Happy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);

  const handleGeneratePlaylist = async (moodData) => {
    setIsGenerating(true);
    
    try {
      let response;
      
      // Check if we're using a custom playlist or a single mood
      if (typeof moodData === 'object' && Object.keys(moodData).length > 1) {
        // Make sure all values are numeric before sending
        const numericMoodData = {};
        for (const [mood, value] of Object.entries(moodData)) {
          numericMoodData[mood] = Number(value);
        }
        
        // Custom playlist with mood percentages
        response = await axios.post('http://localhost:5000/api/generate-custom-playlist', numericMoodData);
      } else {
        // Single mood (traditional approach)
        const mood = typeof moodData === 'object' ? Object.keys(moodData)[0] : selectedMood;
        response = await axios.get(`http://localhost:5000/api/generate-playlist?mood=${mood}`);
      }
      
      console.log("Fetched Playlist:", response.data);
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error generating playlist:', error);
      alert('Failed to generate playlist. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white relative overflow-hidden transition-colors duration-300">
      <WaveformBackground isPlaying={isPlaying} />

      <div className="relative z-10">
        <header className="border-b border-white/10 backdrop-blur-md bg-black/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Music2 className="h-8 w-8 text-purple-300 dark:text-purple-400" />
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 dark:from-purple-400 dark:to-pink-400">
                  MelodAI
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GeneratePlaylistSection
              selectedMood={selectedMood}
              setSelectedMood={setSelectedMood}
              isGenerating={isGenerating}
              handleGeneratePlaylist={handleGeneratePlaylist}
            />
            <GeneratedPlaylistSection playlist={playlist} />
          </div>
        </main>

        <div className="pb-32">
          {/* Pass the required props to MusicPlayer */}
          <MusicPlayer 
            onPlayingChange={setIsPlaying} 
            playlist={playlist} 
            setPlaylist={setPlaylist}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
