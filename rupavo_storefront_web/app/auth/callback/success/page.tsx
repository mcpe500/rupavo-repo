"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Get the stored return URL
    const returnUrl = localStorage.getItem("auth_return_url") || localStorage.getItem("checkout_return_url");
    
    // Clear stored URLs
    localStorage.removeItem("auth_return_url");
    localStorage.removeItem("checkout_return_url");

    // Redirect after a short delay to ensure session is set
    const timer = setTimeout(() => {
      router.push(returnUrl || "/");
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-4" />
      <p className="text-gray-600">Login berhasil, mengarahkan...</p>
    </div>
  );
}
