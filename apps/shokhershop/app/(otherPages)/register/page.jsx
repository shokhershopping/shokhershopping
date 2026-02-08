import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar1 from "@/components/headers/Topbar1";
import Register from "@/components/othersPages/Register";
import React from "react";

export const metadata = {
  title: "Register || Shokher Shopping",
  description: "Create your Shokher Shopping account",
};
export default function page() {
  return (
    <>
      <Topbar1 />
      <Header1 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Register</div>
        </div>
      </div>

      <Register />
      <Footer1 />
    </>
  );
}
