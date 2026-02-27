"use client";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import React, { useState } from "react";
import Link from "next/link";

const faqData = [
  {
    question: "কিভাবে অর্ডার করবো?",
    answer: (
      <>
        <p>
          আমাদের ওয়েবসাইট www.shokhershopping.com-এ গিয়ে খুব সহজে পছন্দের
          ড্রেস অর্ডার করতে পারেন।
        </p>
        <p>
          অথবা সরাসরি হটলাইনে কল করে (সকাল ১০টা - রাত ৮টা) অর্ডার করতে
          পারেন।
        </p>
        <p>
          <strong>Hotline:</strong>{" "}
          <a href="https://api.whatsapp.com/send/?phone=8801841917370">
            01841917370
          </a>{" "}
          (WhatsApp),{" "}
          <a href="tel:09602917370">09602917370</a> (Call)
        </p>
      </>
    ),
  },
  {
    question: "ওয়েবসাইট থেকে অর্ডার করার ধাপসমূহ কি?",
    answer: (
      <ol style={{ paddingLeft: "20px" }}>
        <li>www.shokhershopping.com লিখে ওয়েবসাইটে প্রবেশ করুন।</li>
        <li>
          পছন্দের প্রোডাক্ট সিলেক্ট করুন (সাইজ, কালার নির্বাচন করে Add to
          Cart/Buy Now করুন)।
        </li>
        <li>আপনার নাম, ঠিকানা, মোবাইল নম্বর ও ইমেইল দিন।</li>
        <li>
          অঞ্চল নির্বাচন করে (ঢাকা/ঢাকার বাইরে) অর্ডার নিশ্চিত করুন।
        </li>
        <li>কুপন থাকলে কোড ব্যবহার করুন।</li>
        <li>
          সব ঠিক থাকলে &quot;Place Order&quot; এ ক্লিক করুন।
        </li>
      </ol>
    ),
  },
  {
    question: "শো-রুম কোথায়?",
    answer: (
      <>
        <p>
          শখের শপিং সম্পূর্ণ অনলাইন ভিত্তিক। শো-রুম না থাকলেও, পণ্য
          কালেকশনের জন্য আমাদের অনলাইন অফিস থেকে সংগ্রহ করতে পারবেন।
        </p>
        <p>
          <strong>অফিস ঠিকানা:</strong> দোকান: ৩,৪ নাম্বার ৫ তলা, গ্লোব
          শপিং সেন্টার, নিউ মার্কেট, ঢাকা-১২০৫
        </p>
      </>
    ),
  },
  {
    question: "শখের শপিং-এ কেন অর্ডার করবেন?",
    answer: (
      <ul style={{ paddingLeft: "20px" }}>
        <li>অরিজিনাল ছবি ও ভিডিও: কোনো রকম কপি/রেপ্লিকা নয়।</li>
        <li>মানসম্মত ফেব্রিকস ও নিখুঁত সেলাই।</li>
        <li>ডেলিভারির আগে ড্রেস চেক করা হয়।</li>
        <li>পরবর্তী সার্ভিস (সমস্যা হলে এক্সচেঞ্জ ইত্যাদি)।</li>
      </ul>
    ),
  },
  {
    question: "অগ্রীম টাকা দিলে কি প্রতারিত হবো?",
    answer: (
      <p>
        না, শখের শপিং একটি বিশ্বাসযোগ্য ব্র্যান্ড। আমরা কাস্টমার
        স্যাটিসফেকশনকে প্রাধান্য দিই। অফিস ঠিকানা, ফোন নম্বর ও রিভিউ দেখে
        নিজেই যাচাই করে নিতে পারেন।
      </p>
    ),
  },
  {
    question: "প্রোডাক্টে সমস্যা থাকলে কি এক্সচেঞ্জ করা যাবে?",
    answer: (
      <p>
        হ্যাঁ, ডেলিভারির আগে চেক করা হয়, তবুও যদি কোন সমস্যা থাকে তবে
        এক্সচেঞ্জ করা যাবে এক্সচেঞ্জ পলিসি অনুযায়ী।
      </p>
    ),
  },
  {
    question: "অন্য পেজে কম দাম, আপনাদেরটা বেশি কেন?",
    answer: (
      <p>
        কাপড়, সেলাই, বোতাম, ঘের, ফিনিশিং এসবেই মূল পার্থক্য। কম দামে বাজে
        প্রোডাক্ট নয়, বরং মিনিমাম প্রফিটে বেস্ট কোয়ালিটি দেয়াই আমাদের
        লক্ষ্য।
      </p>
    ),
  },
  {
    question: "অর্ডারের পর নতুন কিছু যোগ করতে চাইলে?",
    answer: (
      <p>
        অর্ডার কনফার্মের পর ডেলিভারি কোম্পানির কাছে হস্তান্তর হয়ে গেলে নতুন
        প্রোডাক্ট যোগ করা সম্ভব না। নতুন অর্ডার দিতে হবে আলাদা করে।
      </p>
    ),
  },
  {
    question: "ক্যাশ অন ডেলিভারি (COD) মানে কী?",
    answer: (
      <p>
        প্রোডাক্ট হাতে পেয়ে টাকা পরিশোধ করাই হলো ক্যাশ অন ডেলিভারি। সারা
        বাংলাদেশে এই সুবিধা পাচ্ছেন শখের শপিং-এ।
      </p>
    ),
  },
  {
    question: "কুরিয়ার কন্ডিশন সুবিধা কী?",
    answer: (
      <>
        <p>
          প্রোডাক্ট হাতে পেয়ে পছন্দ হলে মূল্য পরিশোধ করে নিতে পারবেন।
        </p>
        <p>
          না পছন্দ হলে শুধুমাত্র ডেলিভারি চার্জ দিয়ে রিটার্ন করতে পারবেন।
        </p>
      </>
    ),
  },
  {
    question: "ডেলিভারিম্যানের কল মিস করেছি, এখন কী করবো?",
    answer: (
      <p>
        কল মিস হলে ডেলিভারিম্যানকে কল ব্যাক করুন বা আমাদের হটলাইনে যোগাযোগ
        করুন নতুন ডেলিভারি শিডিউলের জন্য।
      </p>
    ),
  },
  {
    question:
      "কিছু থানা সদর বা ইউনিয়ন পর্যায়ে COD মেলে না, উপায় কি?",
    answer: (
      <p>
        নিদৃষ্ট কিছু এলাকায় কন্ডিশন ম্যাচ না করার কারণে শুধু মাত্র ডেলিভারি
        চার্জ অ্যাডভান্স দিয়ে বাকি টাকা ক্যাশ অন ডেলিভারি সুবিধা পাবেন।
      </p>
    ),
  },
];

function FaqItem({ question, answer, isOpen, onClick }) {
  return (
    <div className={`flat-toggle2 ${isOpen ? "active" : ""}`}>
      <div className="toggle-title" onClick={onClick} style={{ cursor: "pointer" }}>
        <span className="title-text fw-6">{question}</span>
        <span className="btn-toggle">
          <i
            className={`icon ${isOpen ? "icon-minus" : "icon-plus"}`}
            style={{ fontSize: "16px" }}
          />
        </span>
      </div>
      {isOpen && (
        <div className="toggle-content" style={{ paddingTop: "12px", paddingBottom: "8px" }}>
          {answer}
        </div>
      )}
    </div>
  );
}

export default function page() {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <>
      <Header1 />
      <>
        <div className="tf-page-title style-2">
          <div className="container-full">
            <div className="heading text-center">FAQ</div>
            <p className="text-center text-color-1 mt_5">
              আপনার সকল জিজ্ঞাসা
            </p>
          </div>
        </div>

        <section className="flat-spacing-11">
          <div className="container">
            <div className="tf-accordion-wrap d-flex justify-content-between">
              <div className="content" style={{ flex: 1 }}>
                <div className="flat-accordion2">
                  {faqData.map((item, index) => (
                    <FaqItem
                      key={index}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openIndex === index}
                      onClick={() => handleToggle(index)}
                    />
                  ))}
                </div>
              </div>
              <div className="box tf-other-content radius-10 bg_grey-8">
                <h5 className="mb_20">প্রশ্ন আছে?</h5>
                <p className="text_black-2 mb_40">
                  যদি কোনো প্রশ্ন বা সমস্যায় সাহায্য প্রয়োজন হয়, নিচের
                  বাটনে ক্লিক করে আমাদের সাথে যোগাযোগ করুন।
                  <br />
                  <br />
                  <strong>Hotline:</strong> 01841917370 (WhatsApp) / 09602917370
                  (Call)
                  <br />
                  <strong>সময়:</strong> সকাল ১০টা - রাত ৮টা
                </p>
                <div className="d-flex gap-20 align-items-center">
                  <Link
                    href="/contact"
                    className="tf-btn radius-3 btn-fill animate-hover-btn justify-content-center"
                  >
                    Contact us
                  </Link>
                  <a
                    href="https://api.whatsapp.com/send/?phone=8801841917370"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tf-btn btn-line"
                  >
                    WhatsApp
                    <i className="icon icon-arrow1-top-left" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>

      <Footer1 />
    </>
  );
}
