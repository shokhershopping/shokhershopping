// components/NestedNavItem.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProductCard } from "./shopCards/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { products1 } from "@/data/products";

export function NestedNavItem({
  category,
  isArrow = true,
  textColor = "",
  Linkfs = "",
  level = 0,
}) {
  const pathname = usePathname();
  const hasChildren = category.children && category.children.length > 0;
  const isActive = pathname.startsWith(`/shop/${generatePath(category)}`);

  // Generate URL path for category
  function generatePath(cat) {
    let path = cat.name.toLowerCase().trim();
    let current = cat;
    while (current.parent) {
      current = current.parent;
      path = `${current.name.toLowerCase().trim()}/${path}`;
    }
    return path;
  }

  const categoryPath = generatePath(category);

  return (
    <li className={`menu-item ${level > 0 ? "pl-4" : ""}`}>
      <Link
        href={`/shop/${categoryPath}`}
        className={`item-link ${Linkfs} ${textColor} ${
          isActive ? "activeMenu" : ""
        }`}
      >
        {category.name}
        {isArrow && hasChildren ? <i className="icon icon-arrow-down" /> : ""}
      </Link>

      {hasChildren && (
        <div
          className={`sub-menu ${level > 0 ? "nested-sub-menu" : "mega-menu"}`}
        >
          {level === 0 ? (
            <div className="container">
              <div className="row">
                <div className="col-lg-3">
                  <div className="mega-menu-item">
                    <div className="menu-heading">Subcategories</div>
                    <ul className="menu-list">
                      {category.children.map((child) => (
                        <NestedNavItem
                          key={child.id}
                          category={child}
                          isArrow={isArrow}
                          textColor={textColor}
                          Linkfs={Linkfs}
                          level={level + 1}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="col-lg-9">
                  <div className="menu-heading">Featured Products</div>
                  <div className="hover-sw-nav hover-sw-2">
                    <Swiper
                      modules={[Navigation]}
                      navigation={{
                        prevEl: `.snmpn-${category.id}`,
                        nextEl: `.snmmn-${category.id}`,
                      }}
                      slidesPerView={2}
                      spaceBetween={30}
                      className="swiper tf-product-header wrap-sw-over"
                    >
                      {products1.slice(0, 4).map((product, i) => (
                        <SwiperSlide key={i} className="swiper-slide">
                          <ProductCard product={product} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <div
                      className={`nav-sw nav-next-slider nav-next-product-header box-icon w_46 round snmpn-${category.id}`}
                    >
                      <span className="icon icon-arrow-left" />
                    </div>
                    <div
                      className={`nav-sw nav-prev-slider nav-prev-product-header box-icon w_46 round snmmn-${category.id}`}
                    >
                      <span className="icon icon-arrow-right" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ul className="menu-list">
              {category.children.map((child) => (
                <NestedNavItem
                  key={child.id}
                  category={child}
                  isArrow={isArrow}
                  textColor={textColor}
                  Linkfs={Linkfs}
                  level={level + 1}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
