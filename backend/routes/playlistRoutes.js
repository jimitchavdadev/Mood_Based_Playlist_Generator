const express = require('express');
const router = express.Router();
const { generatePlaylist } = require('../controllers/playlistController');

// Temporary route to test if this file is working
router.get('/test', (req, res) => {
    res.send('Playlist route is working!');
});

// Define a route to generate a playlist
router.post('/generate', generatePlaylist);

module.exports = router;


module.exports = router;
