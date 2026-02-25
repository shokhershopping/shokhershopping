"use client";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import React, { useEffect, useState } from "react";
import { getImageUrl } from "@/lib/getImageUrl";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `/api/categories`
        );

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const res = await response.json();
        const data = res.data;

        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  //get image path
  const getImagePath = (category) => {
    // Category has imageUrl (direct URL string), not image.path
    const url = category?.imageUrl || category?.image?.path || category?.image;
    if (!url) return "/default-product-image.jpg";
    return getImageUrl(url);
  };

  if (loading) {
    return (
      <div className="container-full">
        <div className="text-center py-8">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-full">
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <section className="flat-spacing-4 flat-categorie">
      <div className="container-full">
        <div className="flat-title-v2">
          <div className="box-sw-navigation">
            <div className="nav-sw nav-next-slider snbp1 nav-next-collection snbp107">
              <span className="icon icon-arrow-left" />
            </div>
            <div className="nav-sw nav-prev-slider snbn1 nav-prev-collection snbn107">
              <span className="icon icon-arrow-right" />
            </div>
          </div>
          <span
            className="text-3 fw-7 text-uppercase title wow fadeInUp"
            data-wow-delay="0s"
          >
            SHOP BY CATEGORIES
          </span>
        </div>
        <div className="row">
          <div className="col-xl-9 col-lg-8 col-md-8">
            <Swiper
              dir="ltr"
              className="swiper tf-sw-collection"
              spaceBetween={15}
              modules={[Navigation]}
              navigation={{
                prevEl: ".snbp107",
                nextEl: ".snbn107",
              }}
              breakpoints={{
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                },
                640: {
                  slidesPerView: 2,
                },
              }}
            >
              {categories.map((category) => (
                <SwiperSlide className="swiper-slide" key={category.id}>
                  <div className="collection-item style-left hover-img">
                    <div className="collection-inner">
                      <Link
                        href={`/shop/${category.id}`}
                        className="collection-image img-style"
                      >
                        <Image
                          className="lazyload"
                          src={getImagePath(category)}
                          alt={category.name}
                          width="600"
                          height="721"
                        />
                      </Link>
                      <div className="collection-content">
                        <Link
                          href={`/shop/${category.id}`}
                          className="tf-btn collection-title hover-icon fs-15"
                        >
                          <span>{category.name}</span>
                          <i className="icon icon-arrow1-top-left" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-4">
            <div className="discovery-new-item">
              <h5>Discovery all new items</h5>
              <Link href={`/shop`}>
                <i className="icon-arrow1-top-left" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
