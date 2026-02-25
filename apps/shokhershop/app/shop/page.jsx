"use client";
import { getPageTextFromCollections } from "@/utlis/getPageTextFromCollections";
import { usePathname } from "next/navigation";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import ShopDefault from "@/components/shop/ShopDefault";
import Topbar1 from "@/components/headers/Topbar1";
import React from "react";

export default function Page() {
  const pathname = usePathname();
  const { heading, subheading } = getPageTextFromCollections(pathname);

  return (
    <>
      <Topbar1 />
      <Header1 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">{heading}</div>
          {subheading && (
            <p className="text-center text-2 text_black-2 mt_5">{subheading}</p>
          )}
        </div>
      </div>
      <ShopDefault />
      <Footer1 />
    </>
  );
}
