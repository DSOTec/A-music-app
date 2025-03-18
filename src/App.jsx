import { useState, useEffect } from "react";
import axios from "axios";

export default function MusicApp() {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [playingSong, setPlayingSong] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://robo-music-api.onrender.com/music/my-api";

  // Load stored search results on page load
  useEffect(() => {
    const storedSearchResults = JSON.parse(localStorage.getItem("searchResults")) || [];
    if (storedSearchResults.length > 0) {
      setSongs(storedSearchResults);
    } else {
      fetchTrendingSongs();
    }
  }, []);

  // Fetch trending songs
  const fetchTrendingSongs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const songData = response.data.data || [];
      setSongs(songData);
      localStorage.setItem("searchResults", JSON.stringify(songData)); // Store in localStorage
    } catch (error) {
      console.error("Error fetching songs:", error);
      setSongs([]);
    }
    setLoading(false);
  };

  // Handle search without refreshing
  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${search}`);
      if (response.data.success && response.data.data.length > 0) {
        const newSearchResults = response.data.data;

        // Prevent duplicate songs
        const updatedResults = [...newSearchResults, ...songs].reduce((acc, song) => {
          if (!acc.find((s) => s.songUrl === song.songUrl)) {
            acc.push(song);
          }
          return acc;
        }, []);

        setSongs(updatedResults);
        localStorage.setItem("searchResults", JSON.stringify(updatedResults));
      }
    } catch (error) {
      console.error("Error searching songs:", error);
    }
    setLoading(false);
  };

  // Remove a single song
  const removeSong = (songUrl) => {
    const updatedSongs = songs.filter((song) => song.songUrl !== songUrl);
    setSongs(updatedSongs);
    localStorage.setItem("searchResults", JSON.stringify(updatedSongs));
  };

  // Clear all searches & restore trending songs
  const clearSearch = () => {
    setSearch("");
    localStorage.removeItem("searchResults");
    fetchTrendingSongs();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 body">
      <h1 className="text-3xl font-bold text-center mb-6">Music App</h1>

      {/* Search Bar */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3  rounded-l-md text-white"
          placeholder="Search songs..."
        /><br />
        <button onClick={handleSearch} className="bg-red-500 px-5 py-3">Search</button>
        <button onClick={clearSearch} className="bg-gray-500 px-4 py-2 ml-2 rounded-r-md">Clear</button>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg relative">
                {/* Remove (❌) button */}
                <button 
                  onClick={() => removeSong(song.songUrl)}
                  className="absolute right-0 bottom-4 bg-red-500 text-white w-6 h-6 flex items-center justify-center p-5 mr-2 rounded-md"
                >
                  X
                </button>
                
                <img src={song.songImage} alt={song.songTitle} className="w-full h-40 object-cover rounded-md" />
                <h2 className="text-lg font-semibold mt-2">{song.songTitle}</h2>
                <p className="text-sm text-gray-400">{song.artistName}</p>
                <button onClick={() => setPlayingSong(song.songUrl)} className="mt-2 bg-green-500 px-4 py-2 rounded-md">
                  Play
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 col-span-3">No songs found</p>
          )}
        </div>
      )}

      {/* Audio Player */}
      {playingSong && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center bg-gray-800 p-4 rounded-lg">
          <audio controls autoPlay src={playingSong} className="w-3/4">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}
