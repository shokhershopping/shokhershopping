"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import ShopDefault from "@/components/shop/ShopDefault";
import Topbar1 from "@/components/headers/Topbar1";

export default function Page() {
  const pathname = usePathname();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const categorySlug = pathname.split("/").pop();

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/categories/${categorySlug}`
        );
        const data = await response.json();

        if (data.status === "success") {
          setCategory(data.data);
        } else {
          setError(data.message || "Failed to fetch category");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categorySlug]);

  return (
    <>
      <Topbar1 />
      <Header1 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">
            {loading
              ? "Loading..."
              : error
              ? "Category Not Found"
              : category?.name || "Category"}
          </div>
          {!loading && !error && category?.description && (
            <div
              className="text-center text-2 text_black-2 mt_5"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          )}
          {error && (
            <p className="text-center text-2 text-danger mt_5">
              {error}
            </p>
          )}
        </div>
      </div>
      {!error && <ShopDefault />}
      <Footer1 />
    </>
  );
}
