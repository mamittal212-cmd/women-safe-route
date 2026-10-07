import { useEffect, useState } from "react";
import { searchLocation } from "../services/api";

function LocationSearch({
  label,
  placeholder,
  icon,
  onLocationSelect
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const data = await searchLocation(query);

        // Remove duplicate coordinates/results
        const uniqueResults = data.filter(
          (item, index, array) =>
            index ===
            array.findIndex(
              (other) =>
                other.latitude === item.latitude &&
                other.longitude === item.longitude
            )
        );

        setResults(uniqueResults);
        setShowResults(true);
      } catch (error) {
        console.error(error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(location) {
    setQuery(location.name);
    setResults([]);
    setShowResults(false);

    onLocationSelect(location);
  }

  return (
    <div className="location-search">
      <div className={`field-icon ${icon}`}>
        ●
      </div>

      <div className="field-content">
        <label>{label}</label>

        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
        />

        {loading && (
          <div className="search-status">
            Searching...
          </div>
        )}

        {showResults && results.length > 0 && (
          <div className="search-results">
            {results.map((location, index) => (
              <button
                key={`${location.latitude}-${location.longitude}-${index}`}
                className="search-result"
                onClick={() => handleSelect(location)}
              >
                <span className="result-icon">📍</span>

                <span className="result-name">
                  {location.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationSearch;