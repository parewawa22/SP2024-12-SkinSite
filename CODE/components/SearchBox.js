import { useState, useEffect } from "react";
import Image from "next/image";

export default function SearchBox({ onSearch, onLiveSearch }) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() && onLiveSearch) {
        onLiveSearch(searchQuery.trim());
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    if (onSearch) onSearch(trimmed);
    setSearchQuery("");
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "inline-flex",
          marginTop: "20px",
          alignItems: "center",
          backgroundColor: "white",
          border: "2px solid #fff",
          borderRadius: "25px",
          padding: "1px 15px",
          width: "100%",
        }}
      >
        <input
          type="text"
          placeholder="SEARCH"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            border: "1px solid #ffffff",
            outline: "none",
            fontSize: "1rem",
            fontFamily: "Inria Serif, serif",
            padding: "10px",
            color: "black",
          }}
        />
        <button
          type="submit"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image src="/image/search.png" alt="Search Icon" width={14.55} height={14.55} />
        </button>
      </form>

      <style jsx>{`
        @media (max-width: 768px) {
          div {
            display: flex;
            justify-content: center;
            align-items: center;
            padding-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}
