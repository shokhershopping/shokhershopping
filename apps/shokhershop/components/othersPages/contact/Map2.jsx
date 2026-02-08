import { socialLinksWithBorder } from "@/data/socials";
import React from "react";

export default function Map2() {
  return (
    <section className="flat-spacing-9">
      <div className="container">
        <div className="tf-grid-layout gap-0 lg-col-2">
          <div className="w-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.2824819287616!2d90.38518487599562!3d23.735054388760297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8c87ffcc295%3A0x3f0a9da8152984e3!2sGlobe%20Shopping%20Center!5e0!3m2!1sen!2sbd!4v1708000000000!5m2!1sen!2sbd"
              width="100%"
              height={894}
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="tf-content-left has-mt">
            <div className="sticky-top">
              <h5 className="mb_20">Visit Our Store</h5>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Address</strong>
                </p>
                <p>দোকান: ৩,৪, ৫ তলা, গ্লোব শপিং সেন্টার, নিউ মার্কেট, ঢাকা-১২০৫</p>
              </div>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Phone</strong>
                </p>
                <p>01841917370</p>
              </div>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Email</strong>
                </p>
                <p>shokhershopping@outlook.com</p>
                <p>shokhershopping.ltd@gmail.com</p>
              </div>
              <div className="mb_36">
                <p className="mb_15">
                  <strong>Open Time</strong>
                </p>
                <p className="mb_15">Our store has re-opened for shopping,</p>
                <p>exchange Every day 11am to 7pm</p>
              </div>
              <div>
                <ul className="tf-social-icon d-flex gap-20 style-default">
                  {socialLinksWithBorder.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className={`box-icon link round ${link.className} ${link.borderClass}`}
                      >
                        <i
                          className={`icon ${link.iconSize} ${link.iconClass}`}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
