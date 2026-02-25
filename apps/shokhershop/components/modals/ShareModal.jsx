"use client";
import React, { useState, useEffect } from "react";
import { useContextElement } from "@/context/Context";

export default function ShareModal() {
  const { shareProduct } = useContextElement();
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate the product URL dynamically
    if (typeof window !== "undefined" && shareProduct?.id) {
      const url = `${window.location.origin}/product-detail/${shareProduct.id}`;
      setShareUrl(url);
    }
  }, [shareProduct]);

  const productTitle = encodeURIComponent(shareProduct?.name || "Check out this product");
  const encodedUrl = encodeURIComponent(shareUrl);

  // Social sharing URLs
  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${productTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${productTitle}`,
    // Note: Instagram and TikTok don't support direct sharing via URL, so these will open their respective sites
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Clipboard API may not be available
    }
  };

  const handleSocialShare = (platform) => {
    window.open(socialLinks[platform], "_blank", "width=600,height=400");
  };

  return (
    <div
      className="modal modalCentered fade modalDemo tf-product-modal modal-part-content"
      id="share_social"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title">Share</div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="overflow-y-auto">
            <ul className="tf-social-icon d-flex gap-10">
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleSocialShare("facebook");
                  }}
                  href="#"
                  className="box-icon social-facebook bg_line"
                  title="Share on Facebook"
                >
                  <i className="icon icon-fb" />
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleSocialShare("twitter");
                  }}
                  href="#"
                  className="box-icon social-twiter bg_line"
                  title="Share on Twitter"
                >
                  <i className="icon icon-Icon-x" />
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleSocialShare("instagram");
                  }}
                  href="#"
                  className="box-icon social-instagram bg_line"
                  title="Open Instagram"
                >
                  <i className="icon icon-instagram" />
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleSocialShare("tiktok");
                  }}
                  href="#"
                  className="box-icon social-tiktok bg_line"
                  title="Open TikTok"
                >
                  <i className="icon icon-tiktok" />
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleSocialShare("pinterest");
                  }}
                  href="#"
                  className="box-icon social-pinterest bg_line"
                  title="Share on Pinterest"
                >
                  <i className="icon icon-pinterest-1" />
                </a>
              </li>
            </ul>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="form-share"
              method="post"
              acceptCharset="utf-8"
            >
              <fieldset>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  tabIndex={0}
                  aria-required="true"
                />
              </fieldset>
              <div className="button-submit">
                <button
                  className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
                  type="button"
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
