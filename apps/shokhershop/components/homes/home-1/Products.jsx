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

      // Helper function to get image URL with fallbacks
      const getImageUrl = (image) => {
        if (!image?.path) return null;
        return resolveImageUrl(image.path);
      };

      // Main product images
      const mainImages = Array.isArray(product?.images) ? product.images : [];
      const primaryImageUrl = getImageUrl(mainImages[0]) || defaultImageUrl;
      const hoverImageUrl = getImageUrl(mainImages[1]) || primaryImageUrl;

      // Process variants
      const colors = Array.isArray(product.variableProducts)
        ? product.variableProducts.map((variant) => {
            // Get first image from variant's images
            const variantImage = Array.isArray(variant.images)
              ? variant.images[0]
              : null;
            const variantImageUrl =
              getImageUrl(variantImage) || primaryImageUrl;

            return {
              name: variant.specifications?.color,
              colorClass:
                variant.specifications?.color?.toLowerCase() || "default",
              imgSrc: variantImageUrl,
            };
          })
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
