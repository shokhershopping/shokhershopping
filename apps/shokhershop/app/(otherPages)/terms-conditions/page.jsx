import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Terms & Conditions | Shokher Shopping",
  description: "ব্যবহারের শর্তাবলী - Shokher Shopping",
};

export default function page() {
  return (
    <>
      <Header1 />
      <>
        <div className="tf-page-title style-2">
          <div className="container-full">
            <div className="heading text-center">Terms &amp; Conditions</div>
            <p className="text-center text-color-1 mt_5">
              ব্যবহারের শর্তাবলী
            </p>
          </div>
        </div>

        <section className="flat-spacing-25">
          <div className="container">
            <div className="tf-main-area-page tf-terms-conditions">
              <p>
                Shokher Shopping ওয়েবসাইটে প্রবেশ এবং অর্ডার করার মাধ্যমে
                আপনি নিম্নলিখিত শর্তাবলীতে সম্মত হচ্ছেন। আমরা আপনাকে অনুরোধ
                করব এগুলো মনোযোগ সহকারে পড়তে।
              </p>

              <div className="box">
                <h5 className="mt_30 mb_16">১. সেবা গ্রহণের শর্ত</h5>
                <ul className="tag-list">
                  <li>
                    Shokher Shopping একটি অনলাইন ভিত্তিক প্রতিষ্ঠান যা ড্রেস ও
                    ইসলামিক পোশাক সামগ্রী বিক্রি করে।
                  </li>
                  <li>
                    আপনি আমাদের ওয়েবসাইট www.shokhershopping.com ব্যবহার করে
                    অর্ডার করলে তা আমাদের নিয়ম ও নীতির অধীনে পরিচালিত হবে।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">২. পণ্যের তথ্য ও স্টক</h5>
                <ul className="tag-list">
                  <li>
                    সকল পণ্যের ছবি ও বিবরণ যথাসম্ভব বাস্তবতার সঙ্গে মিল রেখে
                    প্রদর্শন করা হয়।
                  </li>
                  <li>
                    যেকোনো প্রোডাক্টের মূল্য, ডিজাইন, কালার, সাইজ এবং স্টক
                    বিনা নোটিশে পরিবর্তন হতে পারে।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">৩. মূল্য ও পেমেন্ট</h5>
                <ul className="tag-list">
                  <li>
                    অর্ডারকৃত প্রোডাক্টের পেমেন্ট কাস্টমার ক্যাশ অন ডেলিভারি
                    বা পূর্ব নির্ধারিত মাধ্যম অনুযায়ী পরিশোধ করবেন।
                  </li>
                  <li>
                    কিছু বিশেষ এলাকার জন্য ডেলিভারি চার্জ অগ্রিম প্রদান করতে
                    হতে পারে।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">৪. ডেলিভারি ও রিটার্ন</h5>
                <ul className="tag-list">
                  <li>
                    ডেলিভারি সাধারণত ১–৫ কার্যদিবসের মধ্যে সম্পন্ন হয়।
                  </li>
                  <li>
                    রিটার্ন বা এক্সচেঞ্জ পলিসি অনুযায়ী নির্দিষ্ট শর্তে
                    প্রোডাক্ট পরিবর্তন করা যেতে পারে।
                  </li>
                  <li>
                    বিস্তারিত জানতে{" "}
                    <Link href="/delivery-return" style={{ textDecoration: "underline" }}>
                      রিটার্ন পলিসি
                    </Link>{" "}
                    পড়ুন।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">৫. অর্ডার বাতিল / পরিবর্তন</h5>
                <ul className="tag-list">
                  <li>
                    অর্ডার কনফার্ম হওয়ার পর তা বাতিল বা পরিবর্তন করার
                    সময়সীমা সীমিত।
                  </li>
                  <li>
                    প্যাকেজ ডেলিভারির জন্য হস্তান্তর হয়ে গেলে কোনো পরিবর্তন
                    করা সম্ভব হয় না।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">
                  ৬. ব্যক্তিগত তথ্যের গোপনীয়তা
                </h5>
                <ul className="tag-list">
                  <li>
                    আপনার দেওয়া সকল তথ্য আমাদের{" "}
                    <Link href="/privacy-policy" style={{ textDecoration: "underline" }}>
                      প্রাইভেসি পলিসি
                    </Link>{" "}
                    অনুযায়ী সুরক্ষিত রাখা হয়।
                  </li>
                  <li>
                    আমরা আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">৭. দায়বদ্ধতার সীমা</h5>
                <ul className="tag-list">
                  <li>
                    ওয়েবসাইট ব্যবহারের সময় যেকোনো কারিগরি ত্রুটি, ভুল
                    প্রোডাক্ট ইনফো বা স্টক সমস্যার জন্য Shokher Shopping দায়ী
                    থাকবে না।
                  </li>
                  <li>
                    অর্ডার সংক্রান্ত যেকোনো সমস্যা হলে আমাদের কাস্টমার সার্ভিস
                    টিম সর্বোচ্চ সহযোগিতা করবে।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">৮. নীতি পরিবর্তনের অধিকার</h5>
                <ul className="tag-list">
                  <li>
                    Shokher Shopping যে কোনো সময় আমাদের Terms &amp; Conditions
                    আপডেট বা পরিবর্তন করতে পারে।
                  </li>
                  <li>
                    পরিবর্তনের পর ওয়েবসাইট ব্যবহারে আপনি নতুন শর্তাবলী মেনে
                    চলতে বাধ্য থাকবেন।
                  </li>
                </ul>
              </div>

              <div className="box">
                <h5 className="mt_30 mb_16">যোগাযোগ</h5>
                <p>
                  কোনো প্রশ্ন, অভিযোগ বা পরামর্শের জন্য যোগাযোগ করুন:
                </p>
                <ul className="tag-list">
                  <li>
                    Email:{" "}
                    <a href="mailto:shokhershopping@outlook.com">
                      shokhershopping@outlook.com
                    </a>
                  </li>
                  <li>
                    Hotline:{" "}
                    <a href="https://api.whatsapp.com/send/?phone=8801841917370">
                      01841917370
                    </a>{" "}
                    (WhatsApp) /{" "}
                    <a href="tel:09602917370">09602917370</a> (Call)
                  </li>
                </ul>
              </div>

              <div
                className="mt_30 p-4 radius-10"
                style={{ backgroundColor: "#f7f7f7" }}
              >
                <p className="text-center" style={{ fontStyle: "italic" }}>
                  Shokher Shopping-এ অর্ডার করার মাধ্যমে আপনি আমাদের নির্ধারিত
                  সব নিয়ম ও শর্তাবলী মেনে চলতে সম্মত হচ্ছেন।
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
