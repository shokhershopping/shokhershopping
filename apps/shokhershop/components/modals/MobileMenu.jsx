"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import LanguageSelect from "../common/LanguageSelect";
import CurrencySelect from "../common/CurrencySelect";
import { usePathname } from "next/navigation";
import { FaPlus, FaMinus } from "react-icons/fa";

export default function MobileMenu() {
  const pathname = usePathname();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCategories, setOpenCategories] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `/api/categories?limit=1000`
        );
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const data = await response.json();

        const parentCategories = (data.data || []).filter(
          (category) => category.parentId === null
        );
        const subCategories = (data.data || []).filter(
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

  const isMenuActive = (href) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

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

  const toggleCategory = (categoryId) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleSubcategory = (categoryId, childId) => {
    const key = `${categoryId}-${childId}`;
    setOpenCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="offcanvas offcanvas-start canvas-mb" id="mobileMenu">
        <div className="mb-body">
          <ul className="nav-ul-mb">
            {[...Array(5)].map((_, i) => (
              <li key={i} className="nav-mb-item">
                <div className="placeholder-menu-link" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="offcanvas offcanvas-start canvas-mb" id="mobileMenu">
        <div className="mb-body">
          <div className="text-danger p-3">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="offcanvas offcanvas-start canvas-mb" id="mobileMenu">
      <span
        className="icon-close icon-close-popup"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      />
      <div className="mb-canvas-content">
        <div className="mb-body">
          <ul className="nav-ul-mb" id="wrapper-menu-navigation">
            <li className="nav-mb-item">
              <Link
                href="/"
                className={`mb-menu-link ${
                  isMenuActive("/") ? "activeMenu" : ""
                }`}
              >
                <span>Home</span>
              </Link>
            </li>

            {categories.map((category) => (
              <li key={category.id} className="nav-mb-item">
                <div className="d-flex justify-content-between align-items-center">
                  <Link
                    href={`/shop/${category.id}`}
                    className={`collapsed mb-menu-link current${
                      isCategoryActive(category) ? "activeMenu" : ""
                    }`}
                  >
                    <span>{category.name}</span>
                  </Link>

                  {category.children?.length > 0 && (
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={`sub-nav-link collapsed  `}
                      data-bs-toggle="collapse"
                      aria-expanded="true"
                      aria-controls={category.id}
                    >
                      {openCategories[category.id] ? (
                        <FaMinus className="toggle-icon" />
                      ) : (
                        <FaPlus className="toggle-icon" />
                      )}
                    </button>
                  )}
                </div>

                {category.children?.length > 0 &&
                  openCategories[category.id] && (
                    <div className="sub-nav-menu">
                      <ul>
                        {category.children.map((child) => (
                          <li key={child.id} className="sub-nav-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <Link
                                href={`/shop/${category.id}/${child.id}`}
                                className={`sub-nav-link flex-grow-1 ${
                                  isMenuActive(
                                    `/shop/${category.id}/${child.id}`
                                  )
                                    ? "activeMenu"
                                    : ""
                                }`}
                              >
                                {child.name}
                              </Link>

                              {child.grandchildren?.length > 0 && (
                                <button
                                  className="btn-toggle"
                                  onClick={() =>
                                    toggleSubcategory(category.id, child.id)
                                  }
                                  aria-label={`Toggle ${child.name} submenu`}
                                >
                                  {openCategories[
                                    `${category.id}-${child.id}`
                                  ] ? (
                                    <FaMinus className="toggle-icon" />
                                  ) : (
                                    <FaPlus className="toggle-icon" />
                                  )}
                                </button>
                              )}
                            </div>

                            {child.grandchildren?.length > 0 &&
                              openCategories[`${category.id}-${child.id}`] && (
                                <ul className="sub-nav-menu sub-menu-level-2">
                                  {child.grandchildren.map((grandchild) => (
                                    <li
                                      key={grandchild.id}
                                      className="grandchild-item"
                                    >
                                      <Link
                                        href={`/shop/${category.id}/${child.id}/${grandchild.id}`}
                                        className={`sub-nav-link ${
                                          isMenuActive(
                                            `/shop/${category.id}/${child.id}/${grandchild.id}`
                                          )
                                            ? "activeMenu"
                                            : ""
                                        }`}
                                      >
                                        {grandchild.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </li>
            ))}

            <li className="nav-mb-item">
              <Link
                href="/store-locations"
                className={`mb-menu-link ${
                  isMenuActive("/store-locations") ? "activeMenu" : ""
                }`}
              >
                <span>Our Store</span>
              </Link>
            </li>
          </ul>

          <div className="mb-other-content">
            <div className="d-flex group-icon">
              <Link href="/wishlist" className="site-nav-icon">
                <i className="icon icon-heart" />
                Wishlist
              </Link>
              <Link href="/home-search" className="site-nav-icon">
                <i className="icon icon-search" />
                Search
              </Link>
            </div>
            <div className="mb-notice">
              <Link href="/contact-1" className="text-need">
                Need help?
              </Link>
            </div>
            <ul className="mb-info">
              <li>
                Address: 1234 Fashion Street, Suite 567, <br />
                New York, NY 10001
              </li>
              <li>
                Email: <b>info@fashionshop.com</b>
              </li>
              <li>
                Phone: <b>(212) 555-1234</b>
              </li>
            </ul>
          </div>
        </div>
        <div className="mb-bottom">
          <Link href="/login" className="site-nav-icon">
            <i className="icon icon-account" />
            Login
          </Link>
          <div className="bottom-bar-language">
            <div className="tf-currencies">
              <CurrencySelect />
            </div>
            <div className="tf-languages">
              <LanguageSelect
                parentClassName={
                  "image-select center style-default type-languages"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
