"use client";
import Drift from "drift-zoom";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getImageUrl } from "@/lib/getImageUrl";

export default function Slider1ZoomOuter({
  currentColor = "",
  handleColor = () => {},
  allImages = [],
  currentVariantImages = [],
}) {
  const thumbsSwiperRef = useRef(null);
  const mainSwiperRef = useRef(null);
  const driftInstancesRef = useRef([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/touch device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1150 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (currentVariantImages.length > 0 && mainSwiperRef.current) {
      mainSwiperRef.current.slideTo(0);
    }
  }, [currentColor, currentVariantImages]);

  // Initialize Drift zoom — re-run when variant images change
  const initDrift = useCallback(() => {
    // Destroy previous Drift instances
    driftInstancesRef.current.forEach((d) => {
      try { d.destroy(); } catch (_) {}
    });
    driftInstancesRef.current = [];

    const driftAll = document.querySelectorAll(".tf-image-zoom");
    const pane = document.querySelector(".tf-zoom-main");

    driftAll.forEach((el) => {
      const instance = new Drift(el, {
        zoomFactor: 2,
        paneContainer: isMobile ? el.parentElement : pane,
        inlinePane: isMobile,
        handleTouch: isMobile,
        hoverBoundingBox: !isMobile,
        containInline: true,
        touchDelay: 200,
      });
      driftInstancesRef.current.push(instance);
    });
  }, [isMobile]);

  useEffect(() => {
    // Small delay to let Swiper render the images first
    const timer = setTimeout(initDrift, 100);
    return () => clearTimeout(timer);
  }, [currentVariantImages, initDrift]);

  useEffect(() => {
    const handleMouseOver = (event) => {
      const parent = event.target.closest(".section-image-zoom");
      if (parent) parent.classList.add("zoom-active");
    };
    const handleMouseLeave = (event) => {
      const parent = event.target.closest(".section-image-zoom");
      if (parent) parent.classList.remove("zoom-active");
    };

    const zoomElements = document.querySelectorAll(".tf-image-zoom");
    zoomElements.forEach((element) => {
      element.addEventListener("mouseover", handleMouseOver);
      element.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      zoomElements.forEach((element) => {
        element.removeEventListener("mouseover", handleMouseOver);
        element.removeEventListener("mouseleave", handleMouseLeave);
      });
      // Cleanup Drift instances on unmount
      driftInstancesRef.current.forEach((d) => {
        try { d.destroy(); } catch (_) {}
      });
    };
  }, []);

  return (
    <>
      {/* Thumbnail Slider */}
      <Swiper
        dir="ltr"
        direction="vertical"
        spaceBetween={10}
        slidesPerView={6}
        className="tf-product-media-thumbs other-image-zoom"
        onSwiper={(swiper) => (thumbsSwiperRef.current = swiper)}
        modules={[Thumbs]}
        breakpoints={{
          0: { direction: "horizontal" },
          1150: { direction: "vertical" },
        }}
      >
        {allImages.map((image, index) => (
          <SwiperSlide
            key={`${image.variantId}-${index}`}
            className={`stagger-item ${
              image.color?.toLowerCase() === currentColor?.toLowerCase()
                ? "active-variant"
                : ""
            }`}
          >
            <div
              className="item"
              onClick={() => {
                if (image.color && image.color !== currentColor) {
                  handleColor(image.color);
                }
              }}
            >
              <Image
                className="lazyload"
                data-src={getImageUrl(image?.path)}
                alt="Product thumbnail"
                src={getImageUrl(image?.path)}
                width={100}
                height={150}
                loading="lazy"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <Gallery>
        <Swiper
          dir="ltr"
          spaceBetween={10}
          slidesPerView={1}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          className="tf-product-media-main"
          thumbs={{ swiper: thumbsSwiperRef.current }}
          modules={[Thumbs, Navigation]}
          onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
        >
          {currentVariantImages.map((image, index) => (
            <SwiperSlide key={image.id || index}>
              <Item
                original={getImageUrl(image?.path)}
                thumbnail={getImageUrl(image?.path)}
                width={800}
                height={600}
              >
                {({ ref, open }) => (
                  <a className="item" onClick={open}>
                    <Image
                      className="tf-image-zoom lazyload"
                      data-zoom={getImageUrl(image?.path)}
                      data-src={getImageUrl(image?.path)}
                      ref={ref}
                      alt="Product image"
                      src={getImageUrl(image?.path)}
                      width={800}
                      height={600}
                      loading="eager"
                    />
                  </a>
                )}
              </Item>
            </SwiperSlide>
          ))}

          <div className="swiper-button-next button-style-arrow thumbs-next"></div>
          <div className="swiper-button-prev button-style-arrow thumbs-prev"></div>
        </Swiper>
      </Gallery>
    </>
  );
}
