"use client";

import { ProductCardWishlist } from "@/components/shopCards/ProductCardWishlist";
import { useContextElement } from "@/context/Context";
import Link from "next/link";

export default function Wishlist() {
  const { wishList } = useContextElement();

  return (
    <div className="my-account-content account-wishlist">
      <div className="grid-layout wrapper-shop" data-grid="grid-3">
        {/* card product 1 */}
        {wishList && wishList.length > 0 && wishList.map((wishlistItem, i) => (
          <ProductCardWishlist product={wishlistItem} key={wishlistItem.id} />
        ))}
      </div>
      {(!wishList || wishList.length === 0) && (
        <>
          <div
            className="row align-items-center w-100"
            style={{ rowGap: "20px" }}
          >
            <div className="col-lg-3 col-md-6 fs-18">
              Your wishlist is empty
            </div>
            <div className="col-lg-3  col-md-6">
              <Link
                href={`/shop-default`}
                className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
              >
                Explore Products!
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
