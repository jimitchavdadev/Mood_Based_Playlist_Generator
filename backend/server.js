const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const mm = import('music-metadata'); // Use dynamic import

const app = express();
const PORT = 5000;

app.use(cors());

const SONGS_DIR = '/home/totoro/Roger/Projects/Mood-Based-Playlist-Generator/songs/';

app.get('/api/generate-playlist', async (req, res) => {
    const { mood } = req.query;

    if (!mood) {
        return res.status(400).json({ error: 'Mood parameter is required' });
    }

    const moodPath = path.join(SONGS_DIR, mood.toLowerCase());

    if (!fs.existsSync(moodPath)) {
        return res.status(404).json({ error: 'Mood not found' });
    }

    fs.readdir(moodPath, async (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading songs' });
        }

        const audioFiles = files.filter(file => file.endsWith('.mp3') || file.endsWith('.wav'));

        const metadataParser = await mm; // Load music-metadata dynamically

        const songs = await Promise.all(audioFiles.map(async (file) => {
            const filePath = path.join(moodPath, file);
            try {
                const metadata = await metadataParser.parseFile(filePath);
                return {
                    title: metadata.common.title || path.basename(file, path.extname(file)),
                    artist: metadata.common.artist || 'Unknown Artist',
                    duration: metadata.format.duration ? formatDuration(metadata.format.duration) : 'Unknown',
                    filePath: `http://localhost:${PORT}/songs/${mood}/${file}`
                };
            } catch (err) {
                console.error('Error reading metadata for:', file, err);
                return {
                    title: path.basename(file, path.extname(file)),
                    artist: 'Unknown Artist',
                    duration: 'Unknown',
                    filePath: `http://localhost:${PORT}/songs/${mood}/${file}`
                };
            }
        }));

        res.json(songs);
    });
});

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

app.use('/songs', express.static(SONGS_DIR));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
