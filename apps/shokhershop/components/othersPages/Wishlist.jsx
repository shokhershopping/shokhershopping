"use client";
import { useContextElement } from "@/context/Context";
import { ProductCardWishlist } from "../shopCards/ProductCardWishlist";
import Link from "next/link";

export default function Wishlist() {
  const { wishList } = useContextElement();

  console.log("Wishlist items from context:", wishList);

  return (
    <section className="flat-spacing-2">
      <div className="container">
        <div className="grid-layout wrapper-shop" data-grid="grid-4">
          {wishList && wishList.length > 0 && wishList.map((wishlistItem, i) => (
            <ProductCardWishlist key={wishlistItem.id} product={wishlistItem} />
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
    </section>
  );
}
