import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "About Us | Shokher Shopping",
  description:
    "শখের শপিং - ২০১৪ সাল থেকে বিশ্বস্তভাবে Hijab, Abaya, Gown এবং Modest Fashion সেবা দিয়ে আসছি।",
};

export default function page() {
  return (
    <>
      <Header1 />

      {/* Hero Section */}
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">About Us</div>
          <p className="text-center text-color-1 mt_5">
            শখের শপিং সম্পর্কে জানুন
          </p>
        </div>
      </div>

      {/* Who We Are */}
      <section className="flat-spacing-25">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="pe-lg-5">
                <h3 className="mb_20" style={{ lineHeight: "1.4" }}>
                  শখের শপিং
                </h3>
                <h6 className="mb_16 text-color-1">Since 2014</h6>
                <p className="mb_16">
                  শখের শপিং মূলত মহিলাদের জন্য বিশেষভাবে{" "}
                  <strong>Hijab, Abaya, Gown</strong> এবং{" "}
                  <strong>Modest Fashion</strong> ভিত্তিক প্রোডাক্ট অফার করে।
                  আমরা দীর্ঘদিন ধরে (Since 2014) বিশ্বস্তভাবে সেবা দিয়ে আসছি
                  এবং আমাদের হাজার হাজার সন্তুষ্ট গ্রাহক আছেন।
                </p>
                <p className="mb_16">
                  আমাদের প্রতিটি প্রোডাক্টে অরিজিনাল ছবি ও ভিডিও ব্যবহার করা
                  হয় — কোনো রকম কপি বা রেপ্লিকা নয়। মানসম্মত ফেব্রিকস ও
                  নিখুঁত সেলাই নিশ্চিত করতে আমরা প্রতিনিয়ত কাজ করে যাচ্ছি।
                </p>
                <p>
                  কম দামে বাজে প্রোডাক্ট নয়, বরং{" "}
                  <strong>
                    মিনিমাম প্রফিটে বেস্ট কোয়ালিটি দেয়াই আমাদের লক্ষ্য।
                  </strong>
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div
                className="radius-10 overflow-hidden"
                style={{ position: "relative", height: "400px" }}
              >
                <Image
                  src="/images/logo/logo2.png"
                  alt="Shokher Shopping"
                  width={400}
                  height={200}
                  className="d-block mx-auto"
                  style={{ objectFit: "contain", marginTop: "80px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ backgroundColor: "#f7f7f7" }}>
        <div className="container">
          <div className="row text-center py-5">
            <div className="col-6 col-md-3 mb-4 mb-md-0">
              <h3 style={{ color: "#d32f2f" }}>2014</h3>
              <p className="fw-6">থেকে যাত্রা</p>
            </div>
            <div className="col-6 col-md-3 mb-4 mb-md-0">
              <h3 style={{ color: "#d32f2f" }}>১০,০০০+</h3>
              <p className="fw-6">সন্তুষ্ট গ্রাহক</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 style={{ color: "#d32f2f" }}>১০০%</h3>
              <p className="fw-6">অরিজিনাল প্রোডাক্ট</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 style={{ color: "#d32f2f" }}>COD</h3>
              <p className="fw-6">সারা বাংলাদেশে</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="flat-spacing-25">
        <div className="container">
          <h4 className="text-center mb_30">কেন শখের শপিং বেছে নিবেন?</h4>
          <div className="row">
            <div className="col-md-6 col-lg-4 mb-4">
              <div
                className="p-4 radius-10 h-100"
                style={{ backgroundColor: "#fef5f5", border: "1px solid #fde8e8" }}
              >
                <h6 className="mb_10">মানসম্মত ফেব্রিকস</h6>
                <p>
                  কাপড়, সেলাই, বোতাম, ঘের, ফিনিশিং — সবকিছুতে আমরা সেরা
                  মান নিশ্চিত করি। প্রতিটি ড্রেস ডেলিভারির আগে আমাদের টিম
                  দ্বারা চেক করা হয়।
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-4">
              <div
                className="p-4 radius-10 h-100"
                style={{ backgroundColor: "#f5faf5", border: "1px solid #e8f5e8" }}
              >
                <h6 className="mb_10">ক্যাশ অন ডেলিভারি</h6>
                <p>
                  সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা। প্রোডাক্ট
                  হাতে পেয়ে টাকা পরিশোধ করুন। ঢাকা সিটিতে ৳৮০ এবং ঢাকার
                  বাইরে ৳১৫০ ডেলিভারি চার্জ।
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-4">
              <div
                className="p-4 radius-10 h-100"
                style={{ backgroundColor: "#f5f5fa", border: "1px solid #e8e8f5" }}
              >
                <h6 className="mb_10">দ্রুত ডেলিভারি</h6>
                <p>
                  ঢাকা সিটিতে ১–২ কর্মদিবস এবং ঢাকার বাইরে ২–৪ কর্মদিবসের
                  মধ্যে ডেলিভারি। অর্ডার কনফার্মের পর দ্রুততম সময়ে প্রোডাক্ট
                  প্যাকেজিং করা হয়।
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-4">
              <div
                className="p-4 radius-10 h-100"
                style={{ backgroundColor: "#fef9f0", border: "1px solid #fdf0d8" }}
              >
                <h6 className="mb_10">এক্সচেঞ্জ সুবিধা</h6>
                <p>
                  ভুল প্রোডাক্ট বা সমস্যা থাকলে আমাদের এক্সচেঞ্জ পলিসি
                  অনুযায়ী প্রোডাক্ট পরিবর্তন করা যায়। প্রোডাক্ট রিসিভের ২৪
                  থেকে ৪৮ ঘণ্টার মধ্যে জানাতে হবে।
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-4">
              <div
                className="p-4 radius-10 h-100"
                style={{ backgroundColor: "#f0fefe", border: "1px solid #d8f5f5" }}
              >
                <h6 className="mb_10">তথ্য সুরক্ষা</h6>
                <p>
                  আপনার ব্যক্তিগত তথ্য আমরা সতর্কতার সঙ্গে সংরক্ষণ করি।
                  কোনো তৃতীয় পক্ষের কাছে বিক্রি বা ভাড়া দেওয়া হয় না।
                  আপনার গোপনীয়তাই আমাদের অগ্রাধিকার।
                </p>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-4">
              <div
                className="p-4 radius-10 h-100"
                style={{ backgroundColor: "#fef5fa", border: "1px solid #fde8f0" }}
              >
                <h6 className="mb_10">কাস্টমার সাপোর্ট</h6>
                <p>
                  সকাল ১০টা থেকে রাত ৮টা পর্যন্ত আমাদের কাস্টমার সার্ভিস
                  টিম আপনাকে সহায়তা করতে প্রস্তুত। WhatsApp, কল বা Facebook
                  Page-এ যোগাযোগ করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Quick Links */}
      <section style={{ backgroundColor: "#f7f7f7" }}>
        <div className="container py-5">
          <h4 className="text-center mb_30">আমাদের নীতিমালা</h4>
          <div className="row text-center">
            <div className="col-6 col-md-3 mb-4">
              <Link href="/privacy-policy" className="d-block p-3">
                <div
                  className="mx-auto mb_10 d-flex align-items-center justify-content-center"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>&#128274;</span>
                </div>
                <p className="fw-6">গোপনীয়তা নীতিমালা</p>
              </Link>
            </div>
            <div className="col-6 col-md-3 mb-4">
              <Link href="/delivery-return" className="d-block p-3">
                <div
                  className="mx-auto mb_10 d-flex align-items-center justify-content-center"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>&#128260;</span>
                </div>
                <p className="fw-6">রিটার্ন ও এক্সচেঞ্জ</p>
              </Link>
            </div>
            <div className="col-6 col-md-3 mb-4">
              <Link href="/shipping-delivery" className="d-block p-3">
                <div
                  className="mx-auto mb_10 d-flex align-items-center justify-content-center"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>&#128666;</span>
                </div>
                <p className="fw-6">শিপিং পলিসি</p>
              </Link>
            </div>
            <div className="col-6 col-md-3 mb-4">
              <Link href="/terms-conditions" className="d-block p-3">
                <div
                  className="mx-auto mb_10 d-flex align-items-center justify-content-center"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>&#128220;</span>
                </div>
                <p className="fw-6">ব্যবহারের শর্তাবলী</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Office & Contact */}
      <section className="flat-spacing-25">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h4 className="mb_20">যোগাযোগ করুন</h4>
              <div className="mb_16">
                <h6 className="mb_5">অফিস ঠিকানা</h6>
                <p>
                  দোকান: ৩,৪ নাম্বার ৫ তলা, গ্লোব শপিং সেন্টার, নিউ মার্কেট,
                  ঢাকা-১২০৫
                </p>
              </div>
              <div className="mb_16">
                <h6 className="mb_5">ইমেইল</h6>
                <p>
                  <a href="mailto:shokhershopping@outlook.com">
                    shokhershopping@outlook.com
                  </a>
                </p>
              </div>
              <div className="mb_16">
                <h6 className="mb_5">হটলাইন</h6>
                <p>
                  <a href="https://api.whatsapp.com/send/?phone=8801841917370">
                    01841917370
                  </a>{" "}
                  (WhatsApp)
                  <br />
                  <a href="tel:09602917370">09602917370</a> (Call)
                  <br />
                  <span className="text-color-1">
                    সময়: সকাল ১০টা - রাত ৮টা
                  </span>
                </p>
              </div>
              <div className="d-flex gap-10 flex-wrap mt_20">
                <a
                  href="https://www.facebook.com/shoppingshokher"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tf-btn radius-3 btn-fill animate-hover-btn"
                >
                  Facebook Page
                </a>
                <a
                  href="https://api.whatsapp.com/send/?phone=8801841917370"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tf-btn radius-3 btn-outline animate-hover-btn"
                >
                  WhatsApp
                </a>
                <Link
                  href="/faq-1"
                  className="tf-btn radius-3 btn-outline animate-hover-btn"
                >
                  FAQ
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div
                className="p-5 radius-10 text-center"
                style={{ backgroundColor: "#f7f7f7" }}
              >
                <p
                  style={{
                    fontSize: "18px",
                    lineHeight: "1.8",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;Shokher Shopping-এ আপনার ভরসাই আমাদের শক্তি। আমরা
                  প্রতিটি তথ্য সততার সঙ্গে হ্যান্ডেল করি এবং আপনার ব্যক্তিগত
                  গোপনীয়তার প্রতি সর্বোচ্চ সম্মান প্রদর্শন করি।&rdquo;
                </p>
                <p className="mt_16 fw-6">
                  আল্লাহর রহমতে আমরা ভালো কিছু করারই চেষ্টা করি।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer1 />
    </>
  );
}
