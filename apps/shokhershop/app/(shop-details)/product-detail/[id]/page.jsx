import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar1 from "@/components/headers/Topbar1";
import Products from "@/components/shopDetails/Products";
import RecentProducts from "@/components/shopDetails/RecentProducts";
import ShopDetailsTab from "@/components/shopDetails/ShopDetailsTab";
import React from "react";
import Link from "next/link";
import DetailsOuterZoom from "@/components/shopDetails/DetailsOuterZoom";
import { allProducts } from "@/data/products";
import ProductSinglePrevNext from "@/components/common/ProductSinglePrevNext";
import { getProductById } from "firebase-config/services/product.service";
import { transformProduct } from "@/lib/transformProduct";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop Details || Shokher Shopping",
  description: "Shokher Shopping - Product Details",
};

export default async function page({ params }) {
  const { id } = await params;
  let product = allProducts.find((elm) => elm.id == id) || allProducts[0];
  let fetchError = null;

  try {
    const result = await getProductById(id);
    if (result.status === "success" && result.data) {
      const raw = JSON.parse(JSON.stringify(result.data));
      product = transformProduct(raw);
    }
  } catch (err) {
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

      {fetchError && (
        <div className="container alert alert-warning">
          Couldn&apos;t fetch latest product data: {fetchError}. Showing local data
          instead.
        </div>
      )}

      <DetailsOuterZoom product={product} />
      <ShopDetailsTab product={product} />
      <Footer1 />
    </>
  );
}
