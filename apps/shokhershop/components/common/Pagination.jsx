"use client";
import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Generate page numbers with windowing
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Simple case: less than max visible pages
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Complex case: with windowing
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Adjust if at start
    if (currentPage <= 3) {
      endPage = maxVisiblePages;
    }
    // Adjust if at end
    else if (currentPage >= totalPages - 2) {
      startPage = totalPages - maxVisiblePages + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <>
      {/* Previous Button */}
      <li>
        <a
          onClick={() => onPageChange(currentPage - 1)}
          className={`pagination-link animate-hover-btn ${
            currentPage === 1 ? "disabled" : ""
          }`}
          aria-disabled={currentPage === 1}
        >
          <span className="icon icon-arrow-left" />
        </a>
      </li>

      {/* Page Numbers */}
      {pageNumbers.map((page) => (
        <li key={page} className={currentPage === page ? "active" : ""}>
          <a
            className={`pagination-link ${
              currentPage !== page ? "animate-hover-btn" : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </a>
        </li>
      ))}

      {/* Next Button */}
      <li>
        <a
          onClick={() => onPageChange(currentPage + 1)}
          className={`pagination-link animate-hover-btn ${
            currentPage === totalPages ? "disabled" : ""
          }`}
          aria-disabled={currentPage === totalPages}
        >
          <span className="icon icon-arrow-right" />
        </a>
      </li>
    </>
  );
}
