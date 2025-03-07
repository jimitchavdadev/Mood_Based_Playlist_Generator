const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const mm = import('music-metadata'); // Use dynamic import

const app = express();
const PORT = 5000;

app.use(cors());

// Increase the payload size limit (adjust the limit as needed)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const SONGS_DIR = 'songs/';   // Add your own songs to this directory, I have added some for your testing 
const TOTAL_SONGS = 20; // Total number of songs in a custom playlist

// Helper function to get songs for a specific mood
async function getSongsForMood(mood, count) {
    const moodPath = path.join(SONGS_DIR, mood.toLowerCase());
    
    if (!fs.existsSync(moodPath)) {
        return [];
    }
    
    const files = fs.readdirSync(moodPath);
    const audioFiles = files.filter(file => file.endsWith('.mp3') || file.endsWith('.wav'));
    
    // Randomly select files if we have more than we need
    let selectedFiles = audioFiles;
    if (audioFiles.length > count) {
        selectedFiles = audioFiles
            .sort(() => 0.5 - Math.random()) // Shuffle array
            .slice(0, count); // Take only what we need
    }
    
    const metadataParser = await mm; // Load music-metadata dynamically
    
    const songs = await Promise.all(selectedFiles.map(async (file) => {
        const filePath = path.join(moodPath, file);
        try {
            const metadata = await metadataParser.parseFile(filePath);
            
            // Extract the image (if available)
            let image = null;
            if (metadata.common.picture && metadata.common.picture.length > 0) {
                const picture = metadata.common.picture[0];
                // Make sure we're properly converting the Buffer to base64
                const base64Data = Buffer.from(picture.data).toString('base64');
                image = `data:${picture.format};base64,${base64Data}`;
            }
    
            return {
                title: metadata.common.title || path.basename(file, path.extname(file)),
                artist: metadata.common.artist || 'Unknown Artist',
                duration: metadata.format.duration ? formatDuration(metadata.format.duration) : 'Unknown',
                filePath: `http://localhost:${PORT}/songs/${mood.toLowerCase()}/${file}`,
                mood: mood,
                image: image // Include the image in the response
            };
        } catch (err) {
            console.error('Error reading metadata for:', file, err);
            return {
                title: path.basename(file, path.extname(file)),
                artist: 'Unknown Artist',
                duration: 'Unknown',
                filePath: `http://localhost:${PORT}/songs/${mood.toLowerCase()}/${file}`,
                mood: mood,
                image: null // No image available in case of error
            };
        }
    }));
            
    return songs;
}

// Original endpoint for single mood
app.get('/api/generate-playlist', async (req, res) => {
    const { mood } = req.query;

    if (!mood) {
        return res.status(400).json({ error: 'Mood parameter is required' });
    }

    try {
        const songs = await getSongsForMood(mood, TOTAL_SONGS);
        if (songs.length === 0) {
            return res.status(404).json({ error: 'Mood not found or no songs available' });
        }
        res.json(songs);
    } catch (error) {
        console.error('Error generating playlist:', error);
        res.status(500).json({ error: 'Server error generating playlist' });
    }
});

// New endpoint for custom playlists with mood percentages
app.post('/api/generate-custom-playlist', async (req, res) => {
    const moodPercentages = req.body;
    
    if (!moodPercentages || Object.keys(moodPercentages).length === 0) {
        return res.status(400).json({ error: 'Mood percentages are required' });
    }
    
    try {
        // Calculate how many songs to get from each mood based on percentages
        const songCounts = {};
        let remainingSongs = TOTAL_SONGS;
        let remainingPercentage = 100;
        
        // First pass - calculate integer song counts
        for (const [mood, percentage] of Object.entries(moodPercentages)) {
            // Skip moods with 0%
            if (percentage <= 0) {
                songCounts[mood] = 0;
                continue;
            }
            
            const exactCount = (percentage / 100) * TOTAL_SONGS;
            const intCount = Math.floor(exactCount);
            
            songCounts[mood] = intCount;
            remainingSongs -= intCount;
            remainingPercentage -= percentage;
        }
        
        // Second pass - distribute remaining songs based on fractional parts
        const fractionalParts = Object.entries(moodPercentages)
            .filter(([mood, percentage]) => percentage > 0)
            .map(([mood, percentage]) => {
                const exactCount = (percentage / 100) * TOTAL_SONGS;
                return {
                    mood,
                    fractional: exactCount - Math.floor(exactCount)
                };
            })
            .sort((a, b) => b.fractional - a.fractional);
        
        // Distribute remaining songs to moods with highest fractional parts
        for (let i = 0; i < remainingSongs && i < fractionalParts.length; i++) {
            songCounts[fractionalParts[i].mood]++;
        }
        
        // Collect songs for each mood
        const playlistPromises = Object.entries(songCounts)
            .filter(([_, count]) => count > 0)
            .map(([mood, count]) => getSongsForMood(mood, count));
            
        const moodPlaylists = await Promise.all(playlistPromises);
        
        // Flatten the array of arrays
        const playlist = moodPlaylists.flat();
        
        // Shuffle the playlist
        const shuffledPlaylist = playlist.sort(() => 0.5 - Math.random());
        
        res.json(shuffledPlaylist);
    } catch (error) {
        console.error('Error generating custom playlist:', error);
        res.status(500).json({ error: 'Server error generating custom playlist' });
    }
});

// Modified endpoint to analyze voice/text prompts using Groq API and generate playlist
app.post('/api/analyze-mood-prompt', async (req, res) => {
    const { prompt } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    
    try {
        // Use the Groq API to analyze the prompt
        const moodParameters = await analyzeMoodWithGroq(prompt);
        
        // Return just the mood parameters
        res.json(moodParameters);
    } catch (error) {
        console.error('Error analyzing mood prompt:', error);
        res.status(500).json({ 
            error: 'Failed to analyze mood prompt',
            details: error.message 
        });
    }
});

// Function to extract JSON from a string even if it contains other text
function extractJsonFromString(text) {
    try {
        // First try to parse the entire string as JSON
        return JSON.parse(text);
    } catch (error) {
        // If that fails, try to extract JSON from the text using regex
        try {
            // Match JSON object pattern - looks for patterns between { and }
            const jsonRegex = /{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}/g;
            const matches = text.match(jsonRegex);
            
            if (matches && matches.length > 0) {
                // Try each matched pattern to find valid JSON
                for (const match of matches) {
                    try {
                        const parsed = JSON.parse(match);
                        
                        // Verify that the parsed object has the expected mood keys
                        const requiredMoods = ['Happy', 'Sad', 'Party', 'Chill', 'Peace'];
                        const hasAllMoods = requiredMoods.every(mood => 
                            typeof parsed[mood] === 'number' || 
                            typeof parsed[mood] === 'string'
                        );
                        
                        if (hasAllMoods) {
                            // Convert any string values to numbers
                            requiredMoods.forEach(mood => {
                                if (typeof parsed[mood] === 'string') {
                                    parsed[mood] = Number(parsed[mood]);
                                }
                            });
                            
                            return parsed;
                        }
                    } catch (e) {
                        // This match wasn't valid JSON, try the next one
                        continue;
                    }
                }
            }
            
            // If we got here, no valid JSON was found
            throw new Error('No valid mood JSON found in response');
        } catch (regexError) {
            throw new Error('Failed to extract JSON from response');
        }
    }
}

// Updated Groq API integration function
async function analyzeMoodWithGroq(prompt) {
    try {
        // Get Groq API key from environment
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
        
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama3-8b-8192', // Or another suitable model
                messages: [
                    {
                        role: 'system',
                        content: `You are a music mood analyzer assistant. Your task is to analyze the user's text 
                                prompt and determine mood parameters for a music playlist. 
                                
                                The moods to analyze are: Happy, Sad, Party, Chill, and Peace.
                                For each mood, assign a value from 0 to 100 representing the intensity.
                                
                                Respond ONLY with a valid JSON object in the following format:
                                {
                                    "Happy": 0-100,
                                    "Sad": 0-100,
                                    "Party": 0-100,
                                    "Chill": 0-100,
                                    "Peace": 0-100
                                }
                                
                                Make sure the values accurately reflect the user's described mood preferences.
                                If a mood is not mentioned, give it a default value of 20.
                                Ensure all five moods are included in your response.
                                
                                DO NOT include any explanations, just return the JSON object.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1 // Keep temperature low for consistent results
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const content = response.data.choices[0].message.content;
        
        try {
            // Use the more robust JSON extraction function
            const moodParameters = extractJsonFromString(content);
            
            // Ensure all values are within 0-100 range
            const requiredMoods = ['Happy', 'Sad', 'Party', 'Chill', 'Peace'];
            requiredMoods.forEach(mood => {
                if (!(mood in moodParameters)) {
                    moodParameters[mood] = 20; // Default value if missing
                } else {
                    // Convert to number and ensure it's in range
                    moodParameters[mood] = Math.max(0, Math.min(100, Number(moodParameters[mood])));
                }
            });
            
            return moodParameters;
        } catch (parseError) {
            console.error('Error parsing Groq response as JSON:', content);
            throw new Error('Failed to parse Groq response');
        }
    } catch (error) {
        console.error('Error calling Groq API:', error);
        
        // Fallback to keyword-based analysis in case of API failure
        console.log('Falling back to keyword-based analysis');
        return analyzeMoodWithKeywords(prompt);
    }
}

// Keeping the keyword-based analysis as a fallback
function analyzeMoodWithKeywords(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    const moodParams = {
        Happy: 20,
        Sad: 20,
        Party: 20,
        Chill: 20,
        Peace: 20
    };

    // Simple keyword matching for demonstration
    if (lowerPrompt.includes('happy') || lowerPrompt.includes('joy') || 
        lowerPrompt.includes('upbeat') || lowerPrompt.includes('cheerful')) {
        moodParams.Happy = 80;
    }
    
    if (lowerPrompt.includes('sad') || lowerPrompt.includes('melancholy') || 
        lowerPrompt.includes('blue') || lowerPrompt.includes('depressed')) {
        moodParams.Sad = 80;
    }
    
    if (lowerPrompt.includes('party') || lowerPrompt.includes('dance') || 
        lowerPrompt.includes('energetic') || lowerPrompt.includes('club')) {
        moodParams.Party = 80;
    }
    
    if (lowerPrompt.includes('chill') || lowerPrompt.includes('relax') || 
        lowerPrompt.includes('calm') || lowerPrompt.includes('mellow')) {
        moodParams.Chill = 80;
    }
    
    if (lowerPrompt.includes('peace') || lowerPrompt.includes('tranquil') || 
        lowerPrompt.includes('serene') || lowerPrompt.includes('zen')) {
        moodParams.Peace = 80;
    }
    
    // Process specific mood combinations
    if (lowerPrompt.includes('relaxing') && lowerPrompt.includes('happy')) {
        moodParams.Happy = 60;
        moodParams.Chill = 40;
    }
    
    if (lowerPrompt.includes('energetic') && lowerPrompt.includes('happy')) {
        moodParams.Happy = 50;
        moodParams.Party = 50;
    }
    
    if (lowerPrompt.includes('feeling down') || lowerPrompt.includes('depressed')) {
        moodParams.Sad = 70;
        moodParams.Chill = 30;
    }
    
    if (lowerPrompt.includes('focus') || lowerPrompt.includes('concentrate')) {
        moodParams.Chill = 60;
        moodParams.Peace = 40;
    }
    
    if (lowerPrompt.includes('meditation') || lowerPrompt.includes('mindfulness')) {
        moodParams.Peace = 90;
        moodParams.Chill = 10;
    }

    return moodParams;
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

app.use('/songs', express.static(SONGS_DIR));

app.listen(5000, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:5000');
    console.log('Access from other devices at http://192.168.1.4:5000');
  });
  
  