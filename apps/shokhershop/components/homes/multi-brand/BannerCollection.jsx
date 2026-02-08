"use client";

import { recentCollections } from "@/data/categories";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";

export default function BannerCollection() {
  return (
    <section className="flat-spacing-10 pb_10">
      <div className="container">
        <div className="flat-title">
          <span className="title wow fadeInUp" data-wow-delay="0s">
            Explore Seasonal Collections{" "}
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
          {recentCollections.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="collection-item-v4 hover-img">
                <div className="collection-inner">
                  <Link
                    href={`/shop/d65fe678-81a8-4c6e-aa6b-bff53b0e41d7`}
                    className="collection-image img-style radius-10"
                  >
                    <Image
                      className="lazyload"
                      data-src={item.imgSrc}
                      alt={item.imgAlt}
                      src={item.imgSrc}
                      width={800}
                      height={746}
                    />
                  </Link>
                  <div
                    className="collection-content wow fadeInUp"
                    data-wow-delay="0s"
                  >
                    <h5 className="heading text_white">{item.heading}</h5>
                    <Link
                      href={`/shop/c6998759-71ad-4f7f-ab67-bfe83e1a38c5`}
                      className="tf-btn style-3 fw-6 btn-light-icon rounded-full animate-hover-btn"
                    >
                      <span>Shop now</span>
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
