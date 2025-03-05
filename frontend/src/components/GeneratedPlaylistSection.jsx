import React from 'react';

export function GeneratedPlaylistSection({ playlist }) {
  if (!playlist || playlist.length === 0) {
      return (
          <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 rounded-xl p-6 shadow-lg border border-white/20 h-[400px] overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-semibold mb-4">Generated Playlist</h2>
              <p className="text-gray-300">No playlist generated yet. Select a mood and generate one!</p>
          </div>
      );
  }

  return (
      <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 rounded-xl p-6 shadow-lg border border-white/20 h-[400px] overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-semibold mb-4">Generated Playlist</h2>
          <div className="space-y-4">
              {playlist.map((song, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors cursor-pointer border border-white/10">
                      <div className="flex items-center space-x-4">
                          <img
                              src={song.image || 'https://placehold.co/50'}
                              alt="Album cover"
                              className="w-12 h-12 rounded-lg"
                          />
                          <div>
                              <h3 className="font-medium">{song.title}</h3>
                              <p className="text-sm text-purple-200 dark:text-purple-300">{song.artist}</p>
                          </div>
                      </div>
                      <div className="text-sm text-purple-200 dark:text-purple-300">
                          {song.duration || 'Unknown'}
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );
}
