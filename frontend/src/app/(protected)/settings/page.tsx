"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard when a user visits this page
    router.push("/dashboard");
  }, [router]);

  // This return statement won't be visible as the redirect happens first
  return <div>Redirecting to dashboard...</div>;
}
