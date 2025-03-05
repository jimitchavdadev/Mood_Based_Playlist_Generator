import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [currentSong, setCurrentSong] = useState({ title: "Current Song", artist: "Artist Name" });
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);

  useEffect(() => {
    fetchCurrentSong();
  }, []);

  const fetchCurrentSong = async () => {
    try {
      const response = await axios.get('/api/current-song');
      setCurrentSong(response.data);
    } catch (error) {
      console.error("Error fetching song:", error);
    }
  };

  const handlePlayPause = async () => {
    try {
      const backendURL = "http://localhost:3000/api/play"; // Ensure correct URL
      await axios.post(backendURL);
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error controlling playback:", error);
    }
  };  
  const handleNext = async () => {
    try {
      const response = await axios.post('/api/next');
      setCurrentSong(response.data);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing next song:", error);
    }
  };

  const handlePrevious = async () => {
    try {
      const response = await axios.post('/api/previous');
      setCurrentSong(response.data);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing previous song:", error);
    }
  };

  const toggleShuffle = async () => {
    try {
      const response = await axios.post('/api/shuffle');
      setIsShuffle(response.data.shuffle);
    } catch (error) {
      console.error("Error toggling shuffle:", error);
    }
  };

  const toggleLoop = async () => {
    try {
      const response = await axios.post('/api/loop');
      setIsLoop(response.data.loop);
    } catch (error) {
      console.error("Error toggling loop:", error);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    // Volume control logic should be implemented in the backend or audio element.
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-black/30 dark:bg-black/50 border-t border-white/10 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Toggle Button */}
        <button
          onClick={() => setIsPlayerVisible(!isPlayerVisible)}
          className="absolute -top-10 left-1/2 transform -translate-x-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          {isPlayerVisible ? <ChevronDown className="h-5 w-5 text-purple-200" /> : <ChevronUp className="h-5 w-5 text-purple-200" />}
        </button>

        {/* Album Info */}
        <div className="flex items-center space-x-4">
          <img
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop"
            alt="Album cover"
            className="w-12 h-12 rounded-lg"
          />
          <div>
            <h3 className="font-medium text-white">{currentSong.title}</h3>
            <p className="text-sm text-purple-200 dark:text-purple-300">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls and Volume */}
        {isPlayerVisible && (
          <div className="mt-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Controls */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <button onClick={toggleShuffle} className={`text-purple-200 dark:text-purple-300 hover:text-white transition-colors ${isShuffle ? 'text-green-400' : ''}`}>
                <Shuffle className="h-5 w-5" />
              </button>
              <button onClick={handlePrevious} className="text-purple-200 dark:text-purple-300 hover:text-white transition-colors">
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              <button onClick={handleNext} className="text-purple-200 dark:text-purple-300 hover:text-white transition-colors">
                <SkipForward className="h-5 w-5" />
              </button>
              <button onClick={toggleLoop} className={`text-purple-200 dark:text-purple-300 hover:text-white transition-colors ${isLoop ? 'text-green-400' : ''}`}>
                <Repeat className="h-5 w-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5 text-purple-200 dark:text-purple-300" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-white/20 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
