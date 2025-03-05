exports.generatePlaylist = async (req, res) => {
    try {
        // Extract mood from the request body
        const { mood } = req.body;

        if (!mood) {
            return res.status(400).json({ error: "Mood is required!" });
        }

        // Placeholder response (We'll integrate Spotify API later)
        const samplePlaylist = [
            { title: "Happy Vibes", artist: "Artist 1" },
            { title: "Energetic Beats", artist: "Artist 2" },
            { title: "Relaxing Tunes", artist: "Artist 3" }
        ];

        return res.json({
            mood,
            playlist: samplePlaylist
        });

    } catch (error) {
        console.error("Error generating playlist:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
