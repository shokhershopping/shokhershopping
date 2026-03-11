"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ProductCard } from "../shopCards/ProductCard";
import { getImageUrl } from "@/lib/getImageUrl";

export default function RelatedProducts({ product }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      if (!product?.categoryIds?.length) {
        setLoading(false);
        return;
      }

      try {
        const categoryId = product.categoryIds[0];
        const res = await fetch(
          `/api/products?categoryId=${categoryId}&limit=10&status=PUBLISHED`
        );
        const result = await res.json();

        if (result.status === "success" && Array.isArray(result.data)) {
          // Filter out the current product and map to card format
          const filtered = result.data
            .filter((p) => p.id !== product.id)
            .slice(0, 8)
            .map((p) => ({
              ...p,
              imgSrc: p.imgSrc || getImageUrl(p.imageUrls?.[0]),
              imgHoverSrc:
                p.imgHoverSrc || getImageUrl(p.imageUrls?.[1] || p.imageUrls?.[0]),
              title: p.title || p.name,
              price: p.price,
              salePrice: p.salePrice ?? p.price,
            }));

          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [product?.id, product?.categoryIds]);

  if (loading) {
    return (
      <section className="flat-spacing-1 pt_0">
        <div className="container">
          <div className="flat-title">
            <span className="title">Related Products</span>
          </div>
          <div className="text-center py-4">Loading...</div>
        </div>
      </section>
    );
  }

  if (!relatedProducts.length) return null;

  return (
    <section className="flat-spacing-1 pt_0">
      <div className="container">
        <div className="flat-title">
          <span className="title">Related Products</span>
        </div>
        <div className="hover-sw-nav hover-sw-2">
          <Swiper
            dir="ltr"
            className="swiper tf-sw-product-sell wrap-sw-over"
            slidesPerView={4}
            spaceBetween={30}
            breakpoints={{
              1024: { slidesPerView: 4 },
              640: { slidesPerView: 3 },
              0: { slidesPerView: 2, spaceBetween: 15 },
            }}
            modules={[Navigation, Pagination]}
            navigation={{
              prevEl: ".snbp-related",
              nextEl: ".snbn-related",
            }}
            pagination={{ clickable: true, el: ".spd-related" }}
          >
            {relatedProducts.map((item) => (
              <SwiperSlide key={item.id} className="swiper-slide">
                <ProductCard product={item} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="nav-sw nav-next-slider nav-next-product box-icon w_46 round snbp-related">
            <span className="icon icon-arrow-left" />
          </div>
          <div className="nav-sw nav-prev-slider nav-prev-product box-icon w_46 round snbn-related">
            <span className="icon icon-arrow-right" />
          </div>
          <div className="sw-dots style-2 sw-pagination-product justify-content-center spd-related" />
        </div>
      </div>
    </section>
  );
}
