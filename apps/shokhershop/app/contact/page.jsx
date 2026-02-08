import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar1 from "@/components/headers/Topbar1";
import ContactForm2 from "@/components/othersPages/contact/ContactForm2";
import Map2 from "@/components/othersPages/contact/Map2";
import React from "react";

export const metadata = {
  title: "Contact Us || ShokherShopping - Your Fashion Destination",
  description: "Get in touch with ShokherShopping. Visit our store at Globe Shopping Center, New Market, Dhaka or contact us via email and phone.",
};
export default function page() {
  return (
    <>
      <Topbar1 />
      <Header1 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Contact Us</div>
        </div>
      </div>
      <Map2 />
      {/* <ContactForm2 /> */}
      <Footer1 />
    </>
  );
}
