import Track from "./Track";

function SearchResults({ tracks, onAdd }) {
  return (
    <div className="search-results">
      <h2>Search Results</h2>

      {tracks.map((track) => (
        <Track key={track.id} track={track} onAdd={onAdd} />
      ))}
    </div>
  );
}

export default SearchResults;
