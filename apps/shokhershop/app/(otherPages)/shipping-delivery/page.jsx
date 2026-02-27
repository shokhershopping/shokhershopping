import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React from "react";

export const metadata = {
  title: "Shipping & Delivery | Shokher Shopping",
  description: "শিপিং পলিসি ও ডেলিভারি নীতিমালা - Shokher Shopping",
};

export default function page() {
  return (
    <>
      <Header1 />
      <>
        <div className="tf-page-title style-2">
          <div className="container-full">
            <div className="heading text-center">Shipping &amp; Delivery</div>
            <p className="text-center text-color-1 mt_5">
              শিপিং পলিসি (ডেলিভারি নীতিমালা)
            </p>
          </div>
        </div>

        <section className="flat-spacing-25">
          <div className="container">
            <div className="tf-main-area-page tf-page-delivery">
              <p>
                শখের শপিং-এ আমরা প্রতিটি অর্ডার গ্রাহকের সন্তুষ্টি নিশ্চিত
                করতে যত্ন সহকারে প্রক্রিয়া করি। নিচে আমাদের ডেলিভারি
                নীতিমালার বিস্তারিত দেওয়া হলো:
              </p>

              <div className="box">
                <h5 className="mt_30 mb_16">প্যাকেজিং ও প্রস্তুতি</h5>
                <ul className="tag-list">
                  <li>
                    অর্ডার কনফার্ম হওয়ার পর যথাসম্ভব দ্রুততম সময়ে প্রোডাক্ট
                    প্যাকেজিং করা হয়।
                  </li>
                  <li>
                    প্যাকেজিংয়ের পূর্বে প্রতিটি ড্রেস আমাদের টিম দ্বারা চেক
                    করে নিশ্চিত করা হয় যাতে কোনো ধরনের ত্রুটি না থাকে।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">ডেলিভারি সময়সীমা</h5>
                <ul className="tag-list">
                  <li>
                    <strong>ঢাকা সিটির মধ্যে:</strong> সাধারণত ১–২
                    কর্মদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।
                  </li>
                  <li>
                    <strong>ঢাকার বাইরে:</strong> ২–৪ কর্মদিবস সময় লাগতে
                    পারে (কন্ডিশন কুরিয়ার সার্ভিসের মাধ্যমে)।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">ডেলিভারি চার্জ</h5>
                <div
                  className="d-flex gap-20 flex-wrap"
                  style={{ marginBottom: "16px" }}
                >
                  <div
                    className="p-3 radius-10 text-center"
                    style={{
                      backgroundColor: "#f7f7f7",
                      flex: "1",
                      minWidth: "200px",
                    }}
                  >
                    <p className="fw-6" style={{ fontSize: "14px" }}>
                      ঢাকা সিটির মধ্যে
                    </p>
                    <p
                      className="fw-6"
                      style={{ fontSize: "24px", color: "#d32f2f" }}
                    >
                      ৳৮০
                    </p>
                  </div>
                  <div
                    className="p-3 radius-10 text-center"
                    style={{
                      backgroundColor: "#f7f7f7",
                      flex: "1",
                      minWidth: "200px",
                    }}
                  >
                    <p className="fw-6" style={{ fontSize: "14px" }}>
                      ঢাকার বাইরে
                    </p>
                    <p
                      className="fw-6"
                      style={{ fontSize: "24px", color: "#d32f2f" }}
                    >
                      ৳১৫০
                    </p>
                  </div>
                </div>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">পেমেন্ট পলিসি</h5>
                <ul className="tag-list">
                  <li>
                    আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা
                    দিচ্ছি।
                  </li>
                  <li>
                    কিছু ইউনিয়ন/থানা অঞ্চলে COD না থাকলে শুধুমাত্র ডেলিভারি
                    চার্জ অ্যাডভান্স নিয়ে বাকি টাকা ডেলিভারির সময় পরিশোধ করা
                    যাবে।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">অর্ডার পরিবর্তন বা বাতিল</h5>
                <ul className="tag-list">
                  <li>
                    অর্ডার কনফার্ম হওয়ার পর দ্রুত ডেলিভারি প্রক্রিয়া শুরু
                    হয়ে যায়। তাই খুব অল্প সময়ের মধ্যেই পরিবর্তন বা বাতিল
                    করার অনুরোধ করতে হবে।
                  </li>
                  <li>
                    প্যাকেজ ডেলিভারি কোম্পানির কাছে চলে গেলে আর কোনো
                    পরিবর্তন বা এক্সট্রা প্রোডাক্ট যুক্ত করা সম্ভব হয় না।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">
                  ডেলিভারিম্যানের সাথে যোগাযোগ
                </h5>
                <ul className="tag-list">
                  <li>
                    ডেলিভারির দিন কুরিয়ার কোম্পানির ডেলিভারিম্যান আপনাকে কল
                    করবেন।
                  </li>
                  <li>
                    যদি কোনো কারণে কল রিসিভ না করতে পারেন, তাহলে আবার তাদের
                    নম্বরে যোগাযোগ করুন বা আমাদের হটলাইনে কল করুন।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">স্পেশাল কন্ডিশন</h5>
                <ul className="tag-list">
                  <li>
                    গ্রাহকের অনুরোধে ঢাকা সিটির মধ্যে অফিস থেকে প্রোডাক্ট
                    সংগ্রহের সুযোগ রয়েছে।
                  </li>
                  <li>
                    অর্ডারকৃত পণ্যে কোনো সমস্যা থাকলে, আমাদের এক্সচেঞ্জ পলিসি
                    অনুসরণ করে প্রোডাক্ট পরিবর্তন করা যাবে (শর্ত প্রযোজ্য)।
                  </li>
                </ul>
              </div>

              <div
                className="mt_30 p-4 radius-10"
                style={{ backgroundColor: "#f7f7f7" }}
              >
                <p className="text-center" style={{ fontStyle: "italic" }}>
                  আমাদের লক্ষ্য সঠিক সময়, সঠিক প্রোডাক্ট ও সঠিকভাবে আপনাকে
                  পৌঁছে দেওয়া।
                  <br />
                  গ্রাহকের সন্তুষ্টিই আমাদের প্রথম অগ্রাধিকার।
                </p>
                <p className="text-center mt_10">
                  কোনো প্রশ্ন থাকলে যোগাযোগ করুন আমাদের হটলাইনে:
                  <br />
                  <a href="https://api.whatsapp.com/send/?phone=8801841917370">
                    01841917370
                  </a>{" "}
                  (WhatsApp) |{" "}
                  <a href="tel:09602917370">09602917370</a> (Call)
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
