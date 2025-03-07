import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, ChevronDown, ChevronUp } from 'lucide-react';

export function MusicPlayer({ onPlayingChange, playlist, setPlaylist }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [originalPlaylist, setOriginalPlaylist] = useState([]);
  
  const audioRef = useRef(null);
  
  // Initialize with the first song if playlist is available
  useEffect(() => {
    if (playlist && playlist.length > 0) {
      setOriginalPlaylist([...playlist]);
      setCurrentSongIndex(0);
    }
  }, [playlist]);
  
  // Update audio element when current song changes
  useEffect(() => {
    if (audioRef.current) {
      if (playlist && playlist.length > 0) {
        audioRef.current.src = playlist[currentSongIndex].filePath;
        audioRef.current.volume = volume / 100;
        
        if (isPlaying) {
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentSongIndex, playlist]);
  
  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  // Update parent component when isPlaying changes
  useEffect(() => {
    if (onPlayingChange) {
      onPlayingChange(isPlaying);
    }
  }, [isPlaying, onPlayingChange]);
  
  // Handle time updates
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };
  
  // Handle song end
  const handleSongEnd = () => {
    if (isLoop) {
      // Replay the same song
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    } else {
      handleNext();
    }
  };
  
  const handlePlayPause = () => {
    if (!playlist || playlist.length === 0) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleNext = () => {
    if (!playlist || playlist.length === 0) return;
    
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= playlist.length) {
      nextIndex = 0; // Loop back to the first song
    }
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!playlist || playlist.length === 0) return;
    
    // If we're more than 3 seconds into the song, restart it instead of going to previous
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1; // Loop to the last song
    }
    setCurrentSongIndex(prevIndex);
    setIsPlaying(true);
  };

  const toggleShuffle = () => {
    if (!playlist || playlist.length === 0) return;
    
    if (!isShuffle) {
      // Enable shuffle: store original playlist and create shuffled one
      setOriginalPlaylist([...playlist]);
      
      const shuffled = [...playlist];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Try to keep current song at current position
      const currentSong = playlist[currentSongIndex];
      const newIndex = shuffled.findIndex(song => song.filePath === currentSong.filePath);
      
      if (newIndex !== -1) {
        // Swap to put current song at current position
        [shuffled[currentSongIndex], shuffled[newIndex]] = [shuffled[newIndex], shuffled[currentSongIndex]];
      }
      
      setPlaylist(shuffled);
    } else {
      // Disable shuffle: restore original playlist
      setPlaylist([...originalPlaylist]);
    }
    
    setIsShuffle(!isShuffle);
  };

  const toggleLoop = () => {
    setIsLoop(!isLoop);
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };
  
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  
  const handleSeek = (e) => {
    const seekTime = Number(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };
  
  // Get current song information
  const currentSong = playlist && playlist.length > 0 ? 
    playlist[currentSongIndex] : 
    { title: "No song selected", artist: "Add songs to playlist" };

  return (
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-black/30 dark:bg-black/50 border-t border-white/10 p-4">
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
      />
      
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
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <span className="text-white text-xs">{currentSong.mood || "♪"}</span>
          </div>
          <div>
            <h3 className="font-medium text-white">{currentSong.title}</h3>
            <p className="text-sm text-purple-200 dark:text-purple-300">{currentSong.artist}</p>
          </div>
          
          {/* Current time / duration - visible on small screens */}
          <div className="text-xs text-purple-200 ml-auto md:hidden">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Controls and Volume */}
        {isPlayerVisible && (
          <div className="mt-4 flex flex-col space-y-4">
            {/* Progress bar */}
            <div className="flex items-center space-x-3">
              <span className="text-xs text-purple-200 hidden md:inline">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-grow h-2 bg-white/20 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-purple-200 hidden md:inline">{formatTime(duration)}</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between md:space-y-0">
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
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
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
          </div>
        )}
      </div>
    </div>
  );
}