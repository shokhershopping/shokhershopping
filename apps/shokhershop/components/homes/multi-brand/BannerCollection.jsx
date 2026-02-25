"use client";

import { recentCollections } from "@/data/categories";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BannerCollection() {
  const [banners, setBanners] = useState(null);

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.data && data.data.length > 0) {
          setBanners(data.data);
        } else {
          setBanners(null);
        }
      })
      .catch(() => setBanners(null));
  }, []);

  const isFromApi = banners !== null;

  // Map Firebase banners to the card format, or use static fallback
  const items = isFromApi
    ? banners.map((b) => ({
        id: b.id,
        imgSrc: b.imageUrl,
        imgAlt: b.title || "banner",
        heading: b.title,
        subheading: b.subtitle || "",
        link: b.buttonLink || "/shop",
        btnText: b.buttonText || "Shop now",
      }))
    : recentCollections.map((item, i) => ({
        id: i,
        imgSrc: item.imgSrc,
        imgAlt: item.imgAlt,
        heading: item.heading,
        subheading: "",
        link: "/shop",
        btnText: "Shop now",
      }));

  return (
    <section className="flat-spacing-10 pb_10">
      <div className="container">
        <div className="flat-title">
          <span className="title wow fadeInUp" data-wow-delay="0s">
            Explore Seasonal Collections
          </span>
        </div>

        {/* Swiper Section */}
        <Swiper
          dir="ltr"
          slidesPerView={2}
          spaceBetween={15}
          pagination={{ clickable: true }}
          breakpoints={{
            0: { slidesPerView: 1 },
            700: { slidesPerView: 2 },
            992: { slidesPerView: 2 },
          }}
          className="tf-sw-recent"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="collection-item-v4 hover-img">
                <div className="collection-inner">
                  <Link
                    href={item.link}
                    className="collection-image img-style radius-10"
                  >
                    <Image
                      className="lazyload"
                      alt={item.imgAlt}
                      src={item.imgSrc}
                      width={800}
                      height={746}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  </Link>
                  <div
                    className="collection-content wow fadeInUp"
                    data-wow-delay="0s"
                  >
                    {item.subheading && (
                      <p className="subheading text_white" style={{ fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "4px" }}>
                        {item.subheading}
                      </p>
                    )}
                    <h5 className="heading text_white">{item.heading}</h5>
                    <Link
                      href={item.link}
                      className="tf-btn style-3 fw-6 btn-light-icon rounded-full animate-hover-btn"
                    >
                      <span>{item.btnText}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
