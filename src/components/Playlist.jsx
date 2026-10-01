import Track from "./Track";

function Playlist({
  playlist,
  onRemove,
  playlistName,
  onPlaylistNameChange,
  onSave,
  isLoggedIn,
  isSaving,
}) {
  return (
    <div className="playlist">
      <h2>Your Playlist</h2>

      <input
        type="text"
        value={playlistName}
        onChange={(event) => onPlaylistNameChange(event.target.value)}
        placeholder="My Playlist"
        disabled={isSaving}
      />

      {playlist.length === 0 ? (
        <p className="empty-playlist">
          Your playlist is empty.
          <br />
          Add some songs from the search results.
        </p>
      ) : (
        <>
          <div className="playlist-tracks">
            {playlist.map((track) => (
              <Track
                key={track.id}
                track={track}
                onAdd={onRemove}
                isRemoval={true}
              />
            ))}
          </div>

          <button
            className="save-button"
            onClick={onSave}
            disabled={!isLoggedIn || isSaving}
          >
            {isSaving
              ? "Saving..."
              : isLoggedIn
                ? "Save to Spotify"
                : "Log in to save"}
          </button>
        </>
      )}
    </div>
  );
}

export default Playlist;
