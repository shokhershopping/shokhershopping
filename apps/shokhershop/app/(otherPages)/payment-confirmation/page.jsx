import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import PaymentConfirmation from "@/components/othersPages/PaymentConfirmation";
import React, { Suspense } from "react";

export const metadata = {
  title: "Payment Confirmation || Shokher Shopping",
  description: "Shokher Shopping - Order Confirmation",
};
export default function page() {
  return (
    <>
      <Header1 />
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Payment confirmation</div>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-5">Loading...</div>}>
        <PaymentConfirmation />
      </Suspense>
      <Footer1 />
    </>
  );
}
