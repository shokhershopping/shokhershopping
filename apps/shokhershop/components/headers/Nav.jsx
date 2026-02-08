"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { products1 } from "@/data/products";
import { ProductCard } from "../shopCards/ProductCard";
import { Navigation } from "swiper/modules";
import { allStore } from "@/data/menu";
import { usePathname } from "next/navigation";

export default function Nav({ isArrow = true, textColor = "", Linkfs = "" }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [latestProducts, setLatestProducts] = useState([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/categories?limit=1000`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();

        const parentCategories = data.data.filter(
          (category) => category.parentId === null
        );
        const subCategories = data.data.filter(
          (category) => category.parentId !== null
        );

        const categoryTree = parentCategories.map((parent) => {
          const children = subCategories.filter(
            (sub) => sub.parentId === parent.id
          );
          const childrenWithGrandchildren = children.map((child) => ({
            ...child,
            grandchildren: subCategories.filter(
              (sub) => sub.parentId === child.id
            ),
          }));

          return {
            ...parent,
            children: childrenWithGrandchildren,
          };
        });

        // Filter to only show categories with isMenu=true
        const menuCategories = categoryTree.filter(cat => cat.isMenu);

        setCategories(menuCategories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  //Get latest products
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/products/top-selling?page=1&limit=12`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch latest products");
        }
        const result = await response.json();

        // Transform API products to match ProductCard expectations
        const transformedProducts = result.data.map((product) => ({
          id: product.id,
          title: product.name,
          price: product.price,
          salePrice: product.salePrice,
          imgSrc: product.images?.[0]?.path
            ? `${process.env.NEXT_PUBLIC_APP_URL}/${product.images[0].path}`
            : "/default-product-image.jpg",
          imgHoverSrc: product.images?.[1]?.path
            ? `${process.env.NEXT_PUBLIC_APP_URL}/${product.images[1].path}`
            : "/default-product-image.jpg",
          colors:
            product.variableProducts?.map((variant) => ({
              name: variant.specifications?.color || "Default",
              colorClass: (
                variant.specifications?.color || "default"
              ).toLowerCase(),
              imgSrc: variant.images?.[0]?.path
                ? `${process.env.NEXT_PUBLIC_APP_URL}/${variant.images[0].path}`
                : "/default-product-image.jpg",
            })) || [],
        }));

        setLatestProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching latest products:", error);
      }
    };

    fetchLatestProducts();
  }, []);
  console.log("Latest Products for nav:", latestProducts);
  const isMenuActive = (menuData, basePath = "") => {
    const currentPath = pathname;
    if (basePath && currentPath.startsWith(basePath)) return true;
    if (!Array.isArray(menuData)) return false;

    const checkLinks = (links) => {
      return links.some((link) => {
        return link.href && currentPath.startsWith(link.href);
      });
    };

    return menuData.some((section) => {
      return section.links && checkLinks(section.links);
    });
  };

  // New function to check if any child or grandchild is active
  const isCategoryActive = (category) => {
    if (pathname.startsWith(`/shop/${category.id}`)) return true;

    if (category.children) {
      return category.children.some((child) => {
        if (pathname.startsWith(`/shop/${category.id}/${child.id}`))
          return true;

        if (child.grandchildren) {
          return child.grandchildren.some((grandchild) =>
            pathname.startsWith(
              `/shop/${category.id}/${child.id}/${grandchild.id}`
            )
          );
        }

        return false;
      });
    }

    return false;
  };

  if (loading) {
    return (
      <ul className="menu">
        <li className="menu-item">Loading navigation...</li>
      </ul>
    );
  }

  if (error) {
    return (
      <ul className="menu">
        <li className="menu-item">Error loading navigation: {error}</li>
      </ul>
    );
  }

  return (
    <>
      <li className="menu-item">
        <Link
          href="/"
          className={`item-link ${Linkfs} ${textColor} ${
            pathname === "/" ? "activeMenu" : ""
          }`}
        >
          Home
        </Link>
      </li>

      {categories.map((category) => (
        <li key={category.id} className="menu-item">
          <Link
            href={`/shop/${category.id}`}
            className={`item-link ${Linkfs} ${textColor} ${
              isCategoryActive(category) ? "activeMenu" : ""
            }`}
          >
            {category.name}
            {isArrow && category.children?.length > 0 ? (
              <i className="icon icon-arrow-down" />
            ) : (
              ""
            )}
          </Link>

          {category.children && category.children.length > 0 && (
            <div className="sub-menu mega-menu">
              <div className="container">
                <div className="row">
                  <div className="col-lg-12">
                    {" "}
                    {/* Changed to full width column */}
                    <div className="mega-menu-item">
                      <div className="row">
                        {" "}
                        {/* Added nested row for subcategories */}
                        {category.children.map((subCategory) => (
                          <div
                            key={subCategory.id}
                            className="col-lg-3 col-md-4 col-sm-6" // Responsive column sizing
                          >
                            <div className="position-relative">
                              <div className="menu-heading">
                                <Link
                                  href={`/shop/${category.id}/${subCategory.id}`}
                                  className={`menu-link-text link position-relative ${
                                    pathname.startsWith(
                                      `/shop/${category.id}/${subCategory.id}`
                                    ) ||
                                    subCategory.grandchildren?.some(
                                      (grandchild) =>
                                        pathname.startsWith(
                                          `/shop/${category.id}/${subCategory.id}/${grandchild.id}`
                                        )
                                    )
                                      ? "activeMenu"
                                      : ""
                                  }`}
                                >
                                  {subCategory.name}
                                </Link>
                              </div>

                              {subCategory.grandchildren?.length > 0 && (
                                <div className="sub-sub-menu">
                                  <ul className="menu-list">
                                    {subCategory.grandchildren.map(
                                      (grandchild) => (
                                        <li key={grandchild.id}>
                                          <Link
                                            href={`/shop/${category.id}/${subCategory.id}/${grandchild.id}`}
                                            className={`menu-link-text link position-relative ${
                                              pathname.startsWith(
                                                `/shop/${category.id}/${subCategory.id}/${grandchild.id}`
                                              )
                                                ? "activeMenu"
                                                : ""
                                            }`}
                                          >
                                            {grandchild.name}
                                          </Link>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="col-lg-4">
                          <div className="menu-heading">Best seller</div>
                          <div className="hover-sw-nav hover-sw-2">
                            <Swiper
                              dir="ltr"
                              modules={[Navigation]}
                              navigation={{
                                prevEl: ".snmpn1",
                                nextEl: ".snmnn1",
                              }}
                              slidesPerView={2}
                              spaceBetween={30}
                              className="swiper tf-product-header wrap-sw-over"
                            >
                              {[...latestProducts]
                                .slice(0, 4)

                                .map((elm, i) => (
                                  <SwiperSlide key={i} className="swiper-slide">
                                    <ProductCard product={elm} />
                                  </SwiperSlide>
                                ))}
                            </Swiper>
                            <div className="nav-sw nav-next-slider nav-next-product-header box-icon w_46 round snmpn1">
                              <span className="icon icon-arrow-left" />
                            </div>
                            <div className="nav-sw nav-prev-slider nav-prev-product-header box-icon w_46 round snmnn1">
                              <span className="icon icon-arrow-right" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </li>
      ))}

      <li className="menu-item">
        <Link
          href="/store-locations"
          className={`item-link ${Linkfs} ${textColor}  ${
            isMenuActive(allStore) ? "activeMenu" : ""
          }`}
        >
          Our Store
        </Link>
      </li>
    </>
  );
}
