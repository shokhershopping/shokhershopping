"use client";

import { useEffect, useState } from "react";

const tabs = [
  { title: "Description", active: true },
  { title: "Review", active: false },
  { title: "Shiping", active: false },
  { title: "Return Policies", active: false },
];

export default function ShopDetailsTab({ product }) {
  const [currentTab, setCurrentTab] = useState(1);
  // fetch reviews from API or use static data
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    // Simulate fetching reviews
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `/api/reviews/product/${product.id}`
        );
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const reviewsData = data.data || [];
        setReviews(reviewsData);
      } catch (error) {
        // Reviews fetch failed silently
      }
    };
    fetchReviews();
  }, [product.id]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <section
      className="flat-spacing-17 pt_0"
      style={{ maxWidth: "100vw", overflow: "clip" }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="widget-tabs style-has-border">
              <ul className="widget-menu-tab">
                {tabs.map((elm, i) => (
                  <li
                    key={i}
                    onClick={() => setCurrentTab(i + 1)}
                    className={`item-title ${
                      currentTab == i + 1 ? "active" : ""
                    } `}
                  >
                    <span className="inner">{elm.title}</span>
                  </li>
                ))}
              </ul>
              <div className="widget-content-tab">
                <div
                  className={`widget-content-inner ${
                    currentTab == 1 ? "active" : ""
                  } `}
                >
                  <div className="">
                    <div
                      className="mb_30"
                      dangerouslySetInnerHTML={{
                        __html: product?.description || "",
                      }}
                    />
                    {/* <div className="tf-product-des-demo">
                      <div className="right">
                        <h3 className="fs-16 fw-5">Features</h3>
                        <ul>
                          <li>Front button placket</li>
                          <li>Adjustable sleeve tabs</li>
                          <li>Babaton embroidered crest at placket and hem</li>
                        </ul>
                        <h3 className="fs-16 fw-5">Materials Care</h3>
                        <ul className="mb-0">
                          <li>Content: 100% LENZING™ ECOVERO™ Viscose</li>
                          <li>Care: Hand wash</li>
                          <li>Imported</li>
                        </ul>
                      </div>
                      <div className="left">
                        <h3 className="fs-16 fw-5">Materials Care</h3>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-machine" />
                          </div>
                          <span>Machine wash max. 30ºC. Short spin.</span>
                        </div>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-iron" />
                          </div>
                          <span>Iron maximum 110ºC.</span>
                        </div>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-bleach" />
                          </div>
                          <span>Do not bleach/bleach.</span>
                        </div>
                        <div className="d-flex gap-10 mb_15 align-items-center">
                          <div className="icon">
                            <i className="icon-dry-clean" />
                          </div>
                          <span>Do not dry clean.</span>
                        </div>
                        <div className="d-flex gap-10 align-items-center">
                          <div className="icon">
                            <i className="icon-tumble-dry" />
                          </div>
                          <span>Tumble dry, medium hear.</span>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${
                    currentTab == 2 ? "active" : ""
                  } `}
                >
                  {/* Reviews Here  */}
                  <div className="tf-product-review">
                    <div className="title mb-4">
                      <h3 className="fs-20 fw-6 mb-3">Customer Reviews</h3>
                      {reviews.length > 0 && (
                        <div className="d-flex align-items-center">
                          <div className="rating-stars me-2">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`bi bi-star${
                                  i < Math.floor(averageRating) ? "-fill" : ""
                                } text-warning`}
                              ></i>
                            ))}
                          </div>
                          <span className="text-muted fs-14">
                            {reviews.length} review
                            {reviews.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {reviews.length > 0 ? (
                      <div className="review-list">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="review-item card mb-3 border-0 "
                          >
                            <div className="card-body">
                              <div className="review-header d-flex justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                  <div
                                    className="avatar bg-primary text-white rounded-circle me-2"
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      lineHeight: "32px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {review.userId.charAt(5).toUpperCase()}{" "}
                                    {/* Using 6th character for avatar */}
                                  </div>
                                  <span className="fw-medium">
                                    User {review.userId.slice(8, 12)}{" "}
                                    {/* Display partial user ID */}
                                  </span>
                                </div>
                                <div className="text-muted fs-14">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                              </div>

                              <div className="rating mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`bi bi-star${
                                      i < review.rating ? "-fill" : ""
                                    } text-warning`}
                                  ></i>
                                ))}
                              </div>

                              <p className="review-content mb-0">
                                {review.comment}
                              </p>

                              {review.status === "APPROVED" && (
                                <div className="verified-badge mt-2">
                                  <span className="badge bg-success bg-opacity-10 text-success fs-12">
                                    <i className="bi bi-patch-check-fill me-1"></i>
                                    Verified Review
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-reviews text-center py-4">
                        <i className="bi bi-chat-square-text fs-1 text-muted mb-3"></i>
                        <h5 className="fw-medium">No reviews yet</h5>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${
                    currentTab == 3 ? "active" : ""
                  } `}
                >
                  <div className="tf-page-privacy-policy">
                    <div className="title">
                      The Company Private Limited Policy
                    </div>
                    <p>
                      The Company Private Limited and each of their respective
                      subsidiary, parent and affiliated companies is deemed to
                      operate this Website (“we” or “us”) recognizes that you
                      care how information about you is used and shared. We have
                      created this Privacy Policy to inform you what information
                      we collect on the Website, how we use your information and
                      the choices you have about the way your information is
                      collected and used. Please read this Privacy Policy
                      carefully. Your use of the Website indicates that you have
                      read and accepted our privacy practices, as outlined in
                      this Privacy Policy.
                    </p>
                    <p>
                      Please be advised that the practices described in this
                      Privacy Policy apply to information gathered by us or our
                      subsidiaries, affiliates or agents: (i) through this
                      Website, (ii) where applicable, through our Customer
                      Service Department in connection with this Website, (iii)
                      through information provided to us in our free standing
                      retail stores, and (iv) through information provided to us
                      in conjunction with marketing promotions and sweepstakes.
                    </p>
                    <p>
                      We are not responsible for the content or privacy
                      practices on any websites.
                    </p>
                    <p>
                      We reserve the right, in our sole discretion, to modify,
                      update, add to, discontinue, remove or otherwise change
                      any portion of this Privacy Policy, in whole or in part,
                      at any time. When we amend this Privacy Policy, we will
                      revise the “last updated” date located at the top of this
                      Privacy Policy.
                    </p>
                    <p>
                      If you provide information to us or access or use the
                      Website in any way after this Privacy Policy has been
                      changed, you will be deemed to have unconditionally
                      consented and agreed to such changes. The most current
                      version of this Privacy Policy will be available on the
                      Website and will supersede all previous versions of this
                      Privacy Policy.
                    </p>
                    <p>
                      If you have any questions regarding this Privacy Policy,
                      you should contact our Customer Service Department by
                      email at marketing@company.com
                    </p>
                  </div>
                </div>
                <div
                  className={`widget-content-inner ${
                    currentTab == 4 ? "active" : ""
                  } `}
                >
                  <div className="tf-page-privacy-policy">
                    <div className="title">Return & Refund Policy</div>
                    <p>
                      At Shokher Shopping, we want you to be completely satisfied
                      with your purchase. If you are not happy with your order,
                      you may return it within the following terms and conditions.
                    </p>

                    <h6 className="fw-6 mb_10">Return Eligibility</h6>
                    <ul className="mb_20">
                      <li>Items must be returned within <strong>3 days</strong> of delivery.</li>
                      <li>Products must be unused, unwashed, and in their original packaging with all tags attached.</li>
                      <li>Items that are damaged, altered, or missing tags will not be accepted for return.</li>
                    </ul>

                    <h6 className="fw-6 mb_10">Non-Returnable Items</h6>
                    <ul className="mb_20">
                      <li>Undergarments and innerwear</li>
                      <li>Customized or personalized products</li>
                      <li>Products marked as &quot;Final Sale&quot; or &quot;Non-Returnable&quot;</li>
                      <li>Gift cards</li>
                    </ul>

                    <h6 className="fw-6 mb_10">How to Initiate a Return</h6>
                    <p>
                      To initiate a return, please contact our customer support
                      team via phone at <strong>+880-1841-917370</strong> or
                      message us on our Facebook page within 3 days of receiving
                      your order. Please provide your order number and reason for
                      the return.
                    </p>

                    <h6 className="fw-6 mb_10">Refund Process</h6>
                    <ul className="mb_20">
                      <li>Once we receive and inspect the returned item, we will process your refund within <strong>5-7 business days</strong>.</li>
                      <li>Refunds will be issued to the original payment method or as store credit, based on your preference.</li>
                      <li>Delivery charges are non-refundable unless the return is due to a defective or wrong product.</li>
                    </ul>

                    <h6 className="fw-6 mb_10">Exchange Policy</h6>
                    <p>
                      We offer exchanges for size or color within 3 days of
                      delivery, subject to stock availability. Please contact our
                      support team to arrange an exchange.
                    </p>

                    <h6 className="fw-6 mb_10">Damaged or Defective Products</h6>
                    <p>
                      If you receive a damaged or defective product, please
                      contact us immediately with photos of the item. We will
                      arrange a free replacement or full refund at no extra cost.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
