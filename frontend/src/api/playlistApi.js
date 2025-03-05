import axios from 'axios';

const API_URL = 'http://localhost:5000/api/playlist';

export const generatePlaylist = async (mood) => {
    try {
        const response = await axios.post(`${API_URL}/generate`, { mood });
        return response.data;
    } catch (error) {
        console.error("Error fetching playlist:", error);
        return { error: "Failed to generate playlist" };
    }
};
