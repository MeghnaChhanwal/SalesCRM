import React, { useState } from 'react';
import styles from '../styles/Search.module.css';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.searchBar}>
        <img src="/Search.png" alt="Search" className={styles.iconImg} />  
        <input
          type="text"
          placeholder="Search here..."
          value={query}
          onChange={handleInputChange}
          className={styles.input}
        />
      </div>
      <div className={styles.bottomBorder}></div>
    </div>
  );
};

export default SearchBar;
