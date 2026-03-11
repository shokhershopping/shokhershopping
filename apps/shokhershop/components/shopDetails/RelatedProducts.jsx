"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ProductCard } from "../shopCards/ProductCard";
import { getImageUrl } from "@/lib/getImageUrl";

function toCardFormat(p) {
  // API returns transformed data: images is [{id, path}], not imageUrls
  const firstImage = p.imgSrc || p.images?.[0]?.path || p.imageUrls?.[0];
  const secondImage =
    p.imgHoverSrc ||
    p.images?.[1]?.path ||
    p.images?.[0]?.path ||
    p.imageUrls?.[1] ||
    p.imageUrls?.[0];

  return {
    ...p,
    imgSrc: getImageUrl(firstImage),
    imgHoverSrc: getImageUrl(secondImage),
    title: p.title || p.name,
    price: p.price,
    salePrice: p.salePrice ?? p.price,
  };
}

export default function RelatedProducts({ product }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        let url;
        // Try category-based fetch first, fallback to latest products
        if (product?.categoryIds?.length) {
          url = `/api/products?categoryId=${product.categoryIds[0]}&limit=10&status=PUBLISHED`;
        } else {
          url = `/api/products/latest?limit=10`;
        }

        const res = await fetch(url);
        const result = await res.json();

        if (result.status === "success" && Array.isArray(result.data)) {
          let items = result.data
            .filter((p) => p.id !== product?.id)
            .slice(0, 8)
            .map(toCardFormat);

          // If category fetch returned too few, supplement with latest
          if (items.length < 4 && product?.categoryIds?.length) {
            const latestRes = await fetch(`/api/products/latest?limit=10`);
            const latestResult = await latestRes.json();
            if (latestResult.status === "success" && Array.isArray(latestResult.data)) {
              const existingIds = new Set(items.map((p) => p.id));
              const extra = latestResult.data
                .filter((p) => p.id !== product?.id && !existingIds.has(p.id))
                .slice(0, 8 - items.length)
                .map(toCardFormat);
              items = [...items, ...extra];
            }
          }

          setRelatedProducts(items);
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
