"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { slides as fallbackSlides } from "@/data/heroslides";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function Hero() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [isFromApi, setIsFromApi] = useState(false);

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
          setSlides(data.data);
          setIsFromApi(true);
        }
      })
      .catch(() => {
        // keep fallback
      });
  }, []);

  const getTextColor = (slide) => {
    if (!isFromApi) return "#ffffff";
    if (slide.textColor === "dark") return "#222222";
    return "#ffffff"; // default light for api banners
  };

  return (
    <div className="tf-slideshow slider-effect-fade position-relative">
      <Swiper
        dir="ltr"
        className="swiper tf-sw-slideshow"
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true, el: ".sp1" }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        speed={1000}
        loop={slides.length > 1}
      >
        {slides.map((slide, index) => {
          const title = isFromApi ? (slide.title || "") : (slide.title || "");
          const subtitle = isFromApi ? slide.subtitle : slide.text;
          const btnText = isFromApi ? (slide.buttonText || "Shop Now") : (slide.btnText || "Shop Now");
          const btnLink = isFromApi ? (slide.buttonLink || "/shop") : "/shop";
          const imgSrc = isFromApi ? slide.imageUrl : slide.imgSrc;
          const color = getTextColor(slide);
          const textShadow = "0 2px 8px rgba(0,0,0,0.5)";

          return (
            <SwiperSlide className="swiper-slide" key={isFromApi ? slide.id : index}>
              <div className="wrap-slider">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="hero-slide-img"
                  alt={title || "banner"}
                  src={imgSrc}
                />
                <div className="box-content">
                  <div className="container">
                    {title && (
                      <h1
                        className="fade-item fade-item-1"
                        style={{ color, textShadow, textTransform: "uppercase" }}
                      >
                        {title.split("\n").map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < title.split("\n").length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </h1>
                    )}
                    {subtitle && (
                      <p
                        className="fade-item fade-item-2"
                        style={{ color, textShadow, textTransform: "uppercase" }}
                      >
                        {subtitle}
                      </p>
                    )}
                    <Link
                      href={btnLink}
                      className="fade-item fade-item-3 tf-btn btn-fill animate-hover-btn btn-xl radius-3"
                    >
                      <span>{btnText}</span>
                      <i className="icon icon-arrow-right" />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="wrap-pagination">
        <div className="container">
          <div className="sw-dots sp1 sw-pagination-slider justify-content-center" />
        </div>
      </div>
    </div>
  );
}
