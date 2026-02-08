import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar1 from "@/components/headers/Topbar1";
import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import React from "react";
import Link from "next/link";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
import { useContextElement } from "@/context/Context";
export const metadata = {
  title: "Shop Details || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
import { allProducts } from "@/data/products";
import ProductSinglePrevNext from "@/components/common/ProductSinglePrevNext";

export default async function page({ params }) {
  const { id } = params;
  let product = allProducts.find((elm) => elm.id == id) || allProducts[0];
  let fetchError = null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/products/${id}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }

    const res = await response.json();
    // Use the fetched product if available
    if (res.data) {
      product = res.data;
      console.log("Fatched product", product);
    }
  } catch (err) {
    console.log(err);
    fetchError = err.message;
  }

  return (
    <>
      <Topbar1 />
      <Header1 />
      <div className="tf-breadcrumb" style={{ marginTop: '80px' }}>
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">
              <Link href={`/`} className="text">
                Home
              </Link>
              <i className="icon icon-arrow-right" />
              <span className="text">
                {product?.name || "Cotton jersey top"}
              </span>
            </div>
            <ProductSinglePrevNext currentId={product.id} />
          </div>
        </div>
      </div>

      {/* Show error if fetch failed */}
      {fetchError && (
        <div className="container alert alert-warning">
          Couldn't fetch latest product data: {fetchError}. Showing local data
          instead.
        </div>
      )}

      <DetailsOuterZoom product={product} />
      <ShopDetailsTab product={product} />
      {/* <Products />
      <RecentProducts /> */}
      <Footer1 />
    </>
  );
}
