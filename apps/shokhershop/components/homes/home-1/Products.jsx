"use client";
import { products1 } from "@/data/products";
import React, { useState, useEffect } from "react";
import { ProductCard } from "../../shopCards/ProductCard";
import { fetchProducts } from "./productService";
import { getImageUrl as resolveImageUrl } from "@/lib/getImageUrl";

export default function Products() {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [allproducts, setAllproducts] = useState([...products1]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    hasNextPage: true,
    total: 0,
  });

  useEffect(() => {
    const loadInitialProducts = async () => {
      setLoading(true);
      try {
        const { data, total } = await fetchProducts();
        setAllproducts(transformProducts(data));
        setPagination((prev) => ({
          ...prev,
          total,
          hasNextPage: data.length === prev.limit, // If we got a full page, assume more exists
        }));
      } catch (error) {
        // Silently handle fetch error
      } finally {
        setLoading(false);
      }
    };

    loadInitialProducts();
  }, []);

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const nextPage = pagination.page + 1;
      const { data } = await fetchProducts(nextPage, pagination.limit);

      setAllproducts((prev) => [...prev, ...transformProducts(data)]);
      setPagination((prev) => ({
        ...prev,
        page: nextPage,
        hasNextPage: data.length === prev.limit, // Only show more button if we got a full page
      }));
    } catch (error) {
      // Silently handle fetch error
    } finally {
      setLoading(false);
    }
  };
  const transformProducts = (apiProducts) => {
    if (!apiProducts || !Array.isArray(apiProducts)) return [];

    return apiProducts.map((product) => {
      const defaultImageUrl = "/default-product-image.jpg";

      // Helper function to get image URL - handles {path} objects and raw URL strings
      const getImageUrl = (image) => {
        if (!image) return null;
        // Raw URL string
        if (typeof image === "string") return resolveImageUrl(image);
        // Object with path
        if (image.path) return resolveImageUrl(image.path);
        // Object with url
        if (image.url) return resolveImageUrl(image.url);
        return null;
      };

      // Collect all possible image sources for the product
      const mainImages = Array.isArray(product?.images) ? product.images : [];
      // Also check imageUrls directly (raw URLs from backend)
      const rawImageUrls = Array.isArray(product?.imageUrls) ? product.imageUrls : [];

      let primaryImageUrl = getImageUrl(mainImages[0]) || getImageUrl(rawImageUrls[0]);
      let hoverImageUrl = getImageUrl(mainImages[1]) || getImageUrl(rawImageUrls[1]);

      // If no base product images, use first variant's images
      if (!primaryImageUrl) {
        const variants = Array.isArray(product.variableProducts) ? product.variableProducts : [];
        for (const v of variants) {
          const vImages = Array.isArray(v.images) ? v.images : [];
          const vRawUrls = Array.isArray(v.imageUrls) ? v.imageUrls : [];
          const firstImg = getImageUrl(vImages[0]) || getImageUrl(vRawUrls[0]);
          if (firstImg) {
            primaryImageUrl = firstImg;
            hoverImageUrl = getImageUrl(vImages[1]) || getImageUrl(vRawUrls[1]) || firstImg;
            break;
          }
        }
      }
      primaryImageUrl = primaryImageUrl || defaultImageUrl;
      hoverImageUrl = hoverImageUrl || primaryImageUrl;

      // Process variants - deduplicate by color
      const seenColors = new Set();
      const colors = Array.isArray(product.variableProducts)
        ? product.variableProducts.reduce((acc, variant) => {
            const colorName = (variant.specifications?.color || variant.color || '').trim();
            const colorKey = colorName?.toLowerCase();
            if (colorKey && !seenColors.has(colorKey)) {
              seenColors.add(colorKey);
              const vImgs = Array.isArray(variant.images) ? variant.images : [];
              const vRawUrls = Array.isArray(variant.imageUrls) ? variant.imageUrls : [];
              const variantImageUrl =
                getImageUrl(vImgs[0]) || getImageUrl(vRawUrls[0]) || primaryImageUrl;
              acc.push({
                name: colorName,
                colorClass: colorKey || "default",
                imgSrc: variantImageUrl,
              });
            }
            return acc;
          }, [])
        : [];

      return {
        ...product, // Preserve all original product data including stock, variableProducts, etc.
        title: product.name,
        imgSrc: primaryImageUrl,
        imgHoverSrc: hoverImageUrl,
        soldOut: product.stock <= 0,
        colors: colors,
      };
    });
  };
  return (
    <section className="flat-spacing-5 pt_0 flat-seller">
      <div className="container">
        <div className="flat-title">
          <span className="title wow fadeInUp" data-wow-delay="0s">
            Best Seller
          </span>
          <p className="sub-title wow fadeInUp" data-wow-delay="0s">
            Shop the Latest Styles: Stay ahead of the curve with our newest
            arrivals
          </p>
        </div>

        {loading && allproducts.length === 0 ? (
          <div className="text-center py-5">Loading products...</div>
        ) : (
          <>
            <div
              className="grid-layout wow fadeInUp"
              data-wow-delay="0s"
              data-grid="grid-4"
            >
              {allproducts.map((product, i) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>

            {pagination.hasNextPage && !loaded && (
              <div className="tf-pagination-wrap view-more-button text-center">
                <button
                  className={`tf-btn-loading tf-loading-default style-2 btn-loadmore ${
                    loading ? "loading" : ""
                  } `}
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  <span className="text">
                    {loading ? "Loading..." : "Load more"}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
