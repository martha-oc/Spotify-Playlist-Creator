import { useEffect, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Playlist from "./components/Playlist";
import Footer from "./components/Footer";
import SearchResults from "./components/SearchResults";
import {
  login,
  getAccessToken,
  getCurrentUser,
  searchSpotify,
  createPlaylist,
  addTracksToPlaylist,
} from "./Spotify.js";

function App() {
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      if (sessionStorage.getItem("spotify_code_used") === code) {
        console.log("Authorization code already processed");
      } else {
        sessionStorage.setItem("spotify_code_used", code);

        console.log("About to exchange authorization code for token");

        getAccessToken(code)
          .then((token) => {
            console.log("Access token received:", !!token);

            setIsLoggedIn(true);

            window.history.replaceState({}, document.title, "/");
          })
          .catch((error) => {
            console.error("Spotify login failed:", error);

            sessionStorage.removeItem("spotify_code_used");
          });

        return;
      }
    }

    const existingToken = localStorage.getItem("access_token");

    if (existingToken) {
      getCurrentUser()
        .then((user) => {
          console.log("Already logged in as:", user.display_name);

          setIsLoggedIn(true);
        })
        .catch((error) => {
          console.error("Existing Spotify session is invalid:", error);

          localStorage.removeItem("access_token");

          setIsLoggedIn(false);
        });
    }
  }, []);

  async function handleSearch(searchTerm) {
    try {
      const results = await searchSpotify(searchTerm);

      setTracks(results);

      console.log(results);
    } catch (error) {
      console.error("Search failed:", error);
      alert(`Search failed: ${error.message}`);
    }
  }

  function addTrack(track) {
    console.log("Adding to playlist:", track.name);

    setPlaylist((currentPlaylist) => {
      if (currentPlaylist.some((item) => item.id === track.id)) {
        return currentPlaylist;
      }

      return [...currentPlaylist, track];
    });
  }

  function removeTrack(track) {
    setPlaylist((currentPlaylist) =>
      currentPlaylist.filter((item) => item.id !== track.id),
    );
  }

  async function savePlaylist() {
    if (playlist.length === 0) {
      alert("Add at least one song to your playlist.");
      return;
    }

    setIsSaving(true);

    try {
      const name = playlistName.trim() || "My Playlist";

      const spotifyPlaylist = await createPlaylist(name);

      const trackUris = playlist.map((track) => track.uri);

      await addTracksToPlaylist(spotifyPlaylist.id, trackUris);

      console.log("Playlist saved to Spotify!");

      setPlaylist([]);
      setTracks([]);
      setPlaylistName("");

      alert("Playlist saved to Spotify!");
    } catch (error) {
      console.error("Could not save playlist:", error);
      alert("Could not save playlist. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="app">
      <Header title="Jammming" />

      {!isLoggedIn ? (
        <button className="login-button" onClick={login}>
          Log in with Spotify
        </button>
      ) : (
        <div className="logged-in">✓ Logged in with Spotify</div>
      )}

      <SearchBar onSearch={handleSearch} />

      <p className="app-description">
        Search for your favourite music and create a playlist.
      </p>

      <div className="main-content">
        <SearchResults tracks={tracks} onAdd={addTrack} />

        <Playlist
          playlist={playlist}
          onRemove={removeTrack}
          playlistName={playlistName}
          onPlaylistNameChange={setPlaylistName}
          onSave={savePlaylist}
          isLoggedIn={isLoggedIn}
          isSaving={isSaving}
        />
      </div>

      <Footer />
    </div>
  );
}

export default App;
