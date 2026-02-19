"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register");
  }, [router]);

  return null;
}
