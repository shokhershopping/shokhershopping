"use client";
import { getPageTextFromCollections } from "@/utlis/getPageTextFromCollections";
import { usePathname } from "next/navigation";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import ShopDefault from "@/components/shop/ShopDefault";
import Topbar1 from "@/components/headers/Topbar1";
import React, { useState, useEffect } from "react";

export default function Page() {
  const pathname = usePathname();
  const { heading, subheading } = getPageTextFromCollections(pathname);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/products/latest?limit=12&page=1`
        );
        if (!res.ok) throw new Error("Failed to fetch products");

        const result = await res.json();
        const data = result.data;

        const transformed = transformProducts(data || []);

        setProducts(transformed);
        setFinalSorted(transformed);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, []);

  const transformProducts = (apiProducts) => {
    if (!apiProducts || !Array.isArray(apiProducts)) return [];

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const defaultImageUrl = "/default-product-image.jpg";

    const getImageUrl = (image) => {
      if (!image?.path) return null;
      // Remove any leading slashes to prevent double slashes in URL
      // const cleanPath = image.path.replace(/^\//, "");
      return `${baseUrl}/${image.path}`;
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
            // Get all images for this specific variant
            const variantImages = imagesByVariant[variant.id] || [];
            // Use the first image if available
            const variantImage = variantImages[0];
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
        id: product.id,
        title: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        imgSrc: primaryImageUrl,
        imgHoverSrc: hoverImageUrl,
        soldOut: product.stock <= 0,
        colors: colors,
      };
    });
  };
  console.log("Fetched latest products:", products);
  return (
    <>
      <Topbar1 />
      <Header1 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">{heading} </div>

          {subheading && (
            <p className="text-center text-2 text_black-2 mt_5">{subheading}</p>
          )}
        </div>
      </div>
      <ShopDefault />
      <Footer1 />
    </>
  );
}
