import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Login from "@/components/othersPages/Login";
import React, { Suspense } from "react";

export const metadata = {
  title: "Login || Ecomus - Ultimate Nextjs Ecommerce Template",
  description: "Ecomus - Ultimate Nextjs Ecommerce Template",
};
export default function page() {
  return (
    <>
      <Header1 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Log in</div>
        </div>
      </div>

      <Suspense fallback={<div className="container"><div className="spinner"></div></div>}>
        <Login />
      </Suspense>
      <Footer1 />
    </>
  );
}
