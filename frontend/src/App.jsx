import React, { useState } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { MusicPlayer } from './components/MusicPlayer';
import { WaveformBackground } from './components/WaveformBackground';
import { Music2, Sparkles } from 'lucide-react';
import { GeneratePlaylistSection } from './components/GeneratePlaylistSection';
import { GeneratedPlaylistSection } from './components/GeneratedPlaylistSection';
import './styles/globals.css';

function App() {
  const [selectedMood, setSelectedMood] = useState('Happy');
  const [moodIntensity, setMoodIntensity] = useState(50);
  const [energy, setEnergy] = useState(70);
  const [tempo, setTempo] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]); // Ensure only ONE state for playlist

  const handleGeneratePlaylist = async () => {
    setIsGenerating(true);
    try {
        const response = await fetch(`http://localhost:5000/api/generate-playlist?mood=${selectedMood}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Playlist:", data); // Debugging log
        setPlaylist(data); // Ensure playlist state is updated
    } catch (error) {
        console.error("Error fetching playlist:", error);
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
                  Mood Playlist Generator
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Sparkles className="h-5 w-5" />
                  <span>Connect Spotify</span>
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </main>

        <div className="pb-32">
          <MusicPlayer onPlayingChange={setIsPlaying} />
        </div>
      </div>
    </div>
  );
}

export default App;
