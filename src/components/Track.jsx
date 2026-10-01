function Track({ track, onAdd, isRemoval }) {
  return (
    <div>
      <div>
        <h3>{track.name}</h3>

        <p>{track.artists.map((artist) => artist.name).join(", ")}</p>

        <p>{track.album.name}</p>
      </div>

      <button onClick={() => onAdd(track)}>{isRemoval ? "-" : "+"}</button>
    </div>
  );
}

export default Track;
