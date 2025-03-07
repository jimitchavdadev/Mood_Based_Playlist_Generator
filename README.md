# AI-Powered Mood-Based Music Playlist Generator

## 🎵 Overview

An AI-powered music playlist generator that curates playlists based on your mood. With voice and text input, the app allows users to create custom playlists effortlessly. It also features an integrated music player with essential controls like play, pause, shuffle, loop, and volume adjustments.

## ✨ Features

- **Simple UI**: Clean and intuitive interface with dark/light mode support.
- **Mood-Based Playlists**: Generate a playlist based on your mood.
- **Custom Playlist Creation**: Manually refine your playlist.
- **Multiple Input Methods**: Use voice or text to generate playlists.
- **Music Player**: Play, pause, shuffle, loop, adjust volume, and toggle the full player view.

## 📂 Project Structure

```
.
├── backend
│   ├── controllers
│   │   └── playlistController.js
│   ├── package.json
│   ├── package-lock.json
│   ├── routes
│   │   └── playlistRoutes.js
│   └── server.js
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── src
│   │   ├── api
│   │   │   └── playlistApi.js
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── GeneratedPlaylistSection.jsx
│   │   │   ├── GeneratePlaylistSection.jsx
│   │   │   ├── MoodSlider.jsx
│   │   │   ├── MusicPlayer.jsx
│   │   │   ├── styles
│   │   │   │   └── globals.css
│   │   │   ├── ThemeToggle.jsx
│   │   │   ├── VoicePromptInput.jsx
│   │   │   └── WaveformBackground.jsx
│   │   ├── index.css
│   │   ├── lib
│   │   │   └── utils.js
│   │   ├── main.jsx
│   │   ├── styles
│   │   │   └── globals.css
│   │   └── vite-env.d.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── LICENSE
└── README.md
```

## 🚀 Installation & Setup

### Backend Setup

1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the backend folder and add:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   SONGS_DIRECTORY=path_to_your_songs_folder
   ```
4. Organize the `songs` directory by mood-based subfolders.
5. Start the backend server:
   ```sh
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm run dev
   ```

## 🎯 Future Enhancements

- **Spotify Integration**: Connect to Spotify for dynamic playlist creation.
- **Playlist Export**: Save and export curated playlists to a user’s Spotify account.
- **Improved UI/UX**: Enhance user experience with animations and more themes.

## 📜 License

This project is licensed under the MIT License.

## 🤝 Contribution

Feel free to fork the repository and submit pull requests. Contributions are always welcome!

## 📬 Contact

For any questions or suggestions, please open an issue on GitHub.

Happy listening! 🎧
