"use client";

import { layouts } from "@/data/shop";
import ProductGrid from "./ProductGrid";
import { useState, useEffect } from "react";
import Pagination from "../common/Pagination";
import ShopFilter from "./ShopFilter";
import Sorting from "./Sorting";
import { usePathname } from "next/navigation";
import { getImageUrl as resolveImageUrl } from "@/lib/getImageUrl";

export default function ShopDefault() {
  const pathname = usePathname();
  const [gridItems, setGridItems] = useState(4);
  const [products, setProducts] = useState([]);
  const [finalSorted, setFinalSorted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [categoryInfo, setCategoryInfo] = useState(null);

  const itemsPerPage = 12;
  const pathSegments = pathname.split("/").filter(Boolean);
  const isShopRoot = pathSegments.length === 1 && pathSegments[0] === "shop";
  const categoryId = isShopRoot ? null : pathSegments[pathSegments.length - 1];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build API URL based on route
        let apiUrl;
        if (isShopRoot) {
          // Fetch latest products for /shop route
          apiUrl = `/api/products/latest?limit=${itemsPerPage}&page=${currentPage}`;
        } else {
          // Fetch products for specific category (backend handles recursive subcategories)
          apiUrl = `/api/products?limit=${itemsPerPage}&page=${currentPage}&category=${categoryId}`;
        }

        const response = await fetch(apiUrl);
        const data = await response.json();

        // Set pagination data from API response
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || 0);

        // Transform and set products
        const transformed = transformProducts(data.data || []);
        setProducts(transformed);
        setFinalSorted(transformed);
      } catch (error) {
        // Silently handle fetch error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, categoryId, itemsPerPage, isShopRoot]);

  // Rest of the component remains the same...
  const transformProducts = (apiProducts) => {
    if (!apiProducts || !Array.isArray(apiProducts)) return [];

    const defaultImageUrl = "/default-product-image.jpg";

    const getImageUrl = (image) => {
      if (!image?.path) return null;
      return resolveImageUrl(image.path);
    };

    return apiProducts.map((product) => {
      const mainImages = Array.isArray(product?.images) ? product.images : [];
      const primaryImageUrl = getImageUrl(mainImages[0]) || defaultImageUrl;
      const hoverImageUrl = getImageUrl(mainImages[1]) || primaryImageUrl;

      // Group images by variantId first
      const imagesByVariant = {};
      mainImages.forEach((image) => {
        if (image.variantId) {
          if (!imagesByVariant[image.variantId]) {
            imagesByVariant[image.variantId] = [];
          }
          imagesByVariant[image.variantId].push(image);
        }
      });

      const colors = Array.isArray(product.variableProducts)
        ? product.variableProducts.map((variant) => {
            // Try variant-level images first, then product-level images grouped by variantId
            const variantOwnImages = Array.isArray(variant.images) ? variant.images : [];
            const variantGroupedImages = imagesByVariant[variant.id] || [];
            const variantImage = variantOwnImages[0] || variantGroupedImages[0];
            const variantImageUrl =
              getImageUrl(variantImage) || defaultImageUrl;

            return {
              name: variant.specifications?.color || variant.color || "Default",
              colorClass: (
                variant.specifications?.color?.toLowerCase() || "default"
              ).replace(/\s+/g, "-"),
              imgSrc: variantImageUrl,
            };
          })
        : [];

      return {
        ...product, // Preserve all original product data
        title: product.name,
        imgSrc: primaryImageUrl,
        imgHoverSrc: hoverImageUrl,
        soldOut: product.stock <= 0,
        colors: colors,
      };
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="flat-spacing-2">
        <div className="container">
          <div className="tf-shop-control grid-3 align-items-center">
            <div className="tf-control-filter">
              {/* <a
                href="#filterShop"
                data-bs-toggle="offcanvas"
                aria-controls="offcanvasLeft"
                className="tf-btn-filter"
              >
                <span className="icon icon-filter" />
                <span className="text">Filter</span>
              </a> */}
            </div>
            <ul className="tf-control-layout d-flex justify-content-center">
              {layouts.map((layout, index) => (
                <li
                  key={index}
                  className={`tf-view-layout-switch ${layout.className} ${
                    gridItems == layout.dataValueGrid ? "active" : ""
                  }`}
                  onClick={() => setGridItems(layout.dataValueGrid)}
                >
                  <div className="item">
                    <span className={`icon ${layout.iconClass}`} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="tf-control-sorting d-flex justify-content-end">
              <div className="tf-dropdown-sort" data-bs-toggle="dropdown">
                <Sorting setFinalSorted={setFinalSorted} products={products} />
              </div>
            </div>
          </div>

          <div className="wrapper-control-shop">
            <div className="meta-filter-shop" />

            {loading ? (
              <div className="text-center py-5">Loading products...</div>
            ) : (
              <>
                <ProductGrid allproducts={finalSorted} gridItems={gridItems} />

                {finalSorted.length ? (
                  <ul className="tf-pagination-wrap tf-pagination-list tf-pagination-btn">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </ul>
                ) : (
                  ""
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* <ShopFilter setProducts={setProducts} /> */}
    </>
  );
}
