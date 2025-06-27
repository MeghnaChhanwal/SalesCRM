// src/components/SearchBar.jsx
import React, { useState } from "react";
import styles from "../styles/Search.module.css";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) onSearch(val);
  };

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.searchBar}>
        <img src="/Search.png" alt="Search" className={styles.iconImg} />
        <input
          type="search"
          placeholder="Search..."
          value={query}
          onChange={handleChange}
          className={styles.input}
          autoComplete="off"
        />
      </div>
      <div className={styles.bottomBorder}></div>
    </div>
  );
};

export default SearchBar;
