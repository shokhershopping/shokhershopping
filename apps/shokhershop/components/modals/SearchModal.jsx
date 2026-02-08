"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";

export default function SearchModal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounced search function
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If search query is empty, reset state
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    // Set up new debounced search
    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchQuery.trim());
    }, 300); // 300ms debounce delay

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const performSearch = async (query) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await apiClient.searchProducts(query, {
        limit: 10,
        page: 1,
        status: "PUBLISHED",
      });

      setSearchResults(response.data || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Search error:", err);
        setError("Failed to search products. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
  };

  // Calculate display price for a product
  const getProductPrice = (product) => {
    // Check if product has variants
    if (product.variableProducts && product.variableProducts.length > 0) {
      // Get price from first variant
      const variant = product.variableProducts[0];
      return {
        price: variant.price,
        salePrice: variant.salePrice,
        isOnSale: variant.salePrice && variant.salePrice < variant.price,
      };
    }
    // Use product's own price
    return {
      price: product.price,
      salePrice: product.salePrice,
      isOnSale: product.salePrice && product.salePrice < product.price,
    };
  };

  // Get product image
  const getProductImage = (product) => {
    // Check if product has images
    if (product.images && product.images.length > 0) {
      return `${process.env.NEXT_PUBLIC_APP_URL}/${product.images[0].path}`;
    }
    // Check if product has variants with images
    if (
      product.variableProducts &&
      product.variableProducts.length > 0 &&
      product.variableProducts[0].images &&
      product.variableProducts[0].images.length > 0
    ) {
      return `${process.env.NEXT_PUBLIC_APP_URL}/${product.variableProducts[0].images[0].path}`;
    }
    // Default placeholder
    return "/images/placeholder.jpg";
  };

  return (
    <div className="offcanvas offcanvas-end canvas-search" id="canvasSearch">
      <div className="canvas-wrapper">
        <header className="tf-search-head">
          <div className="title fw-5">
            Search our site
            <div className="close">
              <span
                className="icon-close icon-close-popup"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
                onClick={handleClearSearch}
              />
            </div>
          </div>
          <div className="tf-search-sticky">
            <form onSubmit={handleSubmit} className="tf-mini-search-frm">
              <fieldset className="text">
                <input
                  type="text"
                  placeholder="Search products..."
                  className=""
                  name="text"
                  tabIndex={0}
                  value={searchQuery}
                  onChange={handleInputChange}
                  aria-required="true"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={handleClearSearch}
                    style={{
                      position: "absolute",
                      right: "50px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "#666",
                    }}
                  >
                    ✕
                  </button>
                )}
              </fieldset>
              <button className="" type="submit">
                <i className="icon-search" />
              </button>
            </form>
          </div>
        </header>
        <div className="canvas-body p-0">
          <div className="tf-search-content">
            {/* Show loading state */}
            {isSearching && (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Searching...</span>
                </div>
                <p className="mt-2">Searching products...</p>
              </div>
            )}

            {/* Show error state */}
            {error && !isSearching && (
              <div className="alert alert-danger m-3" role="alert">
                {error}
              </div>
            )}

            {/* Show search results */}
            {!isSearching && hasSearched && searchResults.length > 0 && (
              <div className="tf-col-content">
                <div className="tf-search-content-title fw-5">
                  Found {searchResults.length} product
                  {searchResults.length !== 1 ? "s" : ""}
                </div>
                <div className="tf-search-hidden-inner">
                  {searchResults.map((product) => {
                    const priceInfo = getProductPrice(product);
                    return (
                      <div className="tf-loop-item" key={product.id}>
                        <div className="image">
                          <Link href={`/product-detail/${product.id}`}>
                            <Image
                              alt={product.name}
                              src={getProductImage(product)}
                              width={150}
                              height={150}
                            />
                          </Link>
                        </div>
                        <div className="content">
                          <Link href={`/product-detail/${product.id}`}>
                            {product.name}
                          </Link>
                          <div className="tf-product-info-price">
                            {priceInfo.isOnSale ? (
                              <>
                                <div className="compare-at-price">
                                  ${priceInfo.price.toFixed(2)}
                                </div>
                                <div className="price-on-sale fw-6">
                                  ${priceInfo.salePrice.toFixed(2)}
                                </div>
                              </>
                            ) : (
                              <div className="price fw-6">
                                ${priceInfo.price.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Show no results message */}
            {!isSearching &&
              hasSearched &&
              searchResults.length === 0 &&
              !error && (
                <div className="text-center py-5">
                  <i
                    className="icon-search"
                    style={{ fontSize: "48px", color: "#ccc" }}
                  />
                  <p className="mt-3 fw-5">No products found</p>
                  <p className="text-muted">
                    Try searching with different keywords
                  </p>
                </div>
              )}

            {/* Show quick links when not searching */}
            {!hasSearched && !searchQuery && (
              <div className="tf-cart-hide-has-results">
                <div className="tf-col-quicklink">
                  <div className="tf-search-content-title fw-5">
                    Quick link
                  </div>
                  <ul className="tf-quicklink-list">
                    <li className="tf-quicklink-item">
                      <Link href={`/shop`} className="">
                        Fashion
                      </Link>
                    </li>
                    <li className="tf-quicklink-item">
                      <Link href={`/shop`} className="">
                        Men
                      </Link>
                    </li>
                    <li className="tf-quicklink-item">
                      <Link href={`/shop`} className="">
                        Women
                      </Link>
                    </li>
                    <li className="tf-quicklink-item">
                      <Link href={`/shop`} className="">
                        Accessories
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
