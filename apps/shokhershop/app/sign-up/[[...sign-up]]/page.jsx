"use client";
import { SignUp, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar1 from "@/components/headers/Topbar1";

export default function SignUpPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/my-account");
    }
  }, [isLoaded, userId, router]);

  // Show nothing while checking auth or if already authenticated
  if (!isLoaded || userId) {
    return null;
  }

  return (
    <>
      <Topbar1 />
      <Header1 />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Sign Up</div>
        </div>
      </div>

      <section className="flat-spacing-10">
        <div className="container">
          <div className="tf-login-form d-flex justify-content-center">
            <SignUp
              appearance={{
                elements: {
                  cardBox: "shadow-none",
                  card: "bg-transparent px-0",
                  headerTitle: "text-2xl font-semibold",
                  formButtonPrimary: "tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center",
                  formFieldInput: "tf-field-input tf-input",
                  footerActionLink: "btn-link link"
                }
              }}
            />
          </div>
        </div>
      </section>

      <Footer1 />
    </>
  );
}
