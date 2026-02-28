import Link from "next/link";
import React from "react";

export default function ProductSinglePrevNext({ currentId }) {
  return (
    <div className="tf-breadcrumb-prev-next">
      <Link
        href="/"
        className="tf-breadcrumb-back hover-tooltip center"
      >
        <i className="icon icon-shop" />
      </Link>
    </div>
  );
}
