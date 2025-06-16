"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const expiresIn = searchParams.get("expires_in");

      if (accessToken && refreshToken && expiresIn) {
        try {
          // Set cookies on client domain
          await axios.post("/api/setCookies", {
            accessToken,
            refreshToken,
            expiresIn,
          });

          router.push("/dashboard");
        } catch (error) {
          console.error("Failed to set cookies:", error);
          router.push("/signin?error=cookie_failed");
        }
      } else {
        router.push("/signin?error=auth_failed");
      }

      setIsLoading(false);
    };

    handleCallback();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Completing authentication...</div>
      </div>
    );
  }

  return null;
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading...</div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
