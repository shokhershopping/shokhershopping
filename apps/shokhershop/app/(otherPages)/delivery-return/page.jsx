import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";

export const metadata = {
  title: "Return & Exchange Policy | Shokher Shopping",
  description: "রিটার্ন ও এক্সচেঞ্জ নীতিমালা - Shokher Shopping",
};

export default function page() {
  return (
    <>
      <Header1 />
      <>
        <div className="tf-page-title style-2">
          <div className="container-full">
            <div className="heading text-center">Return & Exchange Policy</div>
            <p className="text-center text-color-1 mt_5">
              রিটার্ন ও এক্সচেঞ্জ নীতিমালা
            </p>
          </div>
        </div>

        <section className="flat-spacing-25">
          <div className="container">
            <div className="tf-main-area-page tf-page-delivery">
              <p>
                শখের শপিং সবসময় চায়, আপনি আপনার অর্ডার করা প্রোডাক্টে
                শতভাগ সন্তুষ্ট থাকুন। তারপরও কোনো সমস্যা হলে আমরা আমাদের
                নির্ধারিত নীতিমালার আওতায় প্রোডাক্ট রিটার্ন বা এক্সচেঞ্জের
                সুযোগ দিয়ে থাকি।
              </p>

              <div className="box">
                <h5 className="mt_30 mb_16">
                  যেসব কারণে প্রোডাক্ট রিটার্ন/এক্সচেঞ্জ করা যাবে
                </h5>
                <ul className="tag-list">
                  <li>
                    ভুল প্রোডাক্ট, সাইজ বা ভিন্ন ডিজাইন ডেলিভারি হলে
                  </li>
                  <li>
                    ডেলিভার্ড প্রোডাক্টে দাগ, ছেঁড়া বা অন্য কোনো খুঁত থাকলে
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">
                  যেসব কারণে রিটার্ন/এক্সচেঞ্জ প্রযোজ্য নয়
                </h5>
                <ul className="tag-list">
                  <li>ব্যবহারজনিত ক্ষতি বা অস্বাভাবিক ব্যবহার</li>
                  <li>কাস্টমাইজড প্রোডাক্টে ক্ষতি</li>
                  <li>ডিসকাউন্ট বা প্রমোশনাল অফারে কেনা প্রোডাক্ট</li>
                  <li>ট্রায়ালের পর ইন্টেক্ট না থাকা প্রোডাক্ট</li>
                  <li>অরিজিনাল প্যাকেজিং ও মেমো না থাকলে</li>
                  <li>শুধু &quot;পছন্দ হয়নি&quot; এই কারণে</li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">
                  রিটার্ন/এক্সচেঞ্জ করতে হলে যা লাগবে
                </h5>
                <ul className="tag-list">
                  <li>ক্যাশ মেমো / কুরিয়ার রিসিট</li>
                  <li>অর্ডার নম্বর / মোবাইল নম্বর</li>
                  <li>
                    পেমেন্টের মাধ্যম ও তথ্য (যেমনঃ বিকাশ নম্বর, তারিখ,
                    পরিমাণ)
                  </li>
                  <li>সমস্যার বিস্তারিত বিবরণ ও প্রোডাক্ট কোড</li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">অভিযোগ করার সময়সীমা</h5>
                <p>
                  প্রোডাক্ট রিসিভ করার <strong>২৪ থেকে ৪৮ ঘণ্টার</strong>{" "}
                  মধ্যে আমাদেরকে জানাতে হবে।
                </p>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">কোথায় অভিযোগ করবেন</h5>
                <ul className="tag-list">
                  <li>
                    Hotline:{" "}
                    <a href="https://api.whatsapp.com/send/?phone=8801841917370">
                      01841917370
                    </a>{" "}
                    (WhatsApp) /{" "}
                    <a href="tel:09602917370">09602917370</a> (Call)
                  </li>
                  <li>
                    Email:{" "}
                    <a href="mailto:shokhershopping@outlook.com">
                      shokhershopping@outlook.com
                    </a>
                  </li>
                  <li>
                    Facebook Page Inbox:{" "}
                    <a
                      href="https://www.facebook.com/shoppingshokher"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      facebook.com/shoppingshokher
                    </a>
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">
                  কমপ্লেইনের সময় যা দিতে হবে
                </h5>
                <ul className="tag-list">
                  <li>নাম ও ঠিকানা</li>
                  <li>অর্ডার করা প্রোডাক্টের কোড</li>
                  <li>
                    অর্ডার পরিমাণ ও মূল্য (ছাড় থাকলে উল্লেখ করুন)
                  </li>
                  <li>সমস্যা সম্পর্কে সংক্ষিপ্ত বর্ণনা</li>
                </ul>
              </div>

              <div
                className="mt_30 p-4 radius-10"
                style={{ backgroundColor: "#f7f7f7" }}
              >
                <p className="text-center" style={{ fontStyle: "italic" }}>
                  আমাদের টিম প্রতিটি অভিযোগ গুরুত্বের সাথে দেখে থাকে এবং
                  যথাসম্ভব দ্রুত সমাধান দেওয়ার চেষ্টা করে। আপনার সন্তুষ্টিই
                  আমাদের সাফল্য। ইনশাআল্লাহ্।
                </p>
              </div>
            </div>
          </div>
        </section>
      </>

      <Footer1 />
    </>
  );
}
