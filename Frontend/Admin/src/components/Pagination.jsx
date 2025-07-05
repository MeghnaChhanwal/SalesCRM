// src/components/Pagination.jsx
import React from "react";
import styles from "../styles/Pagination.module.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5;

  const generatePageNumbers = () => {
    const pages = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        // Show beginning pages and last
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page and last few
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Show first, current in middle, and last
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={styles.paginationContainer}>
      {/* Previous button */}
      <button
        className={styles.arrowBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>

      {/* Page numbers */}
      <div className={styles.pageNumbers}>
        {generatePageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
              ...
            </span>
          ) : (
            <button
              key={`page-${page}-${index}`}
              className={`${styles.pageBtn} ${
                currentPage === page ? styles.active : ""
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next button */}
      <button
        className={styles.arrowBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
