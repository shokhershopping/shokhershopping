// components/NavSkeleton.js
"use client";
import React from "react";

export const NavSkeleton = () => {
  return (
    <ul className="menu">
      {[...Array(5)].map((_, i) => (
        <li key={i} className="menu-item">
          <div className="item-link skeleton h-6 w-24 rounded" />
        </li>
      ))}
    </ul>
  );
};
