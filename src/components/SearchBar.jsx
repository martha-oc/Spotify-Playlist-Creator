import { useState } from "react";

function SearchBar({ onSearch }) {
  const [term, setTerm] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (term.trim() === "") {
      return;
    }

    onSearch(term);
  }

  return (
    <form className="search-container" onSubmit={handleSubmit}>
      <input
        type="text"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search for a song..."
      />

      <button type="submit">Search</button>
    </form>
  );
}

export default SearchBar;
