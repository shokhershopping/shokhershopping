"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/lib/firebase-auth-provider";

const accountLinks = [
  { href: "/my-account", label: "Dashboard" },
  { href: "/my-account-orders", label: "Orders" },
  { href: "/my-account-address", label: "Addresses" },
  { href: "/my-account-edit", label: "Account Details" },
  { href: "/my-account-wishlist", label: "Wishlist" },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useFirebaseAuth();

  const handleLogout = async (e) => {
    e.preventDefault();
    await signOut();
    router.push("/");
  };

  return (
    <ul className="my-account-nav">
      {accountLinks.map((link, index) => (
        <li key={index}>
          <Link
            href={link.href}
            className={`my-account-nav-item ${
              pathname == link.href ? "active" : ""
            }`}
          >
            {link.label}
          </Link>
        </li>
      ))}
      <li>
        <a href="#" onClick={handleLogout} className="my-account-nav-item">
          Logout
        </a>
      </li>
    </ul>
  );
}
