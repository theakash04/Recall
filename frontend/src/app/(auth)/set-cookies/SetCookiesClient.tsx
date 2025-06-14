"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function SetCookiesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const refresh = searchParams.get("refresh");

    if (token && refresh) {
      Cookies.set("sb_token", token, {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "None",
        maxAge: 15 * 60 * 1000,
      });
      Cookies.set("sb_refresh", refresh, {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "None",
        maxAge: 60 * 60 * 24 * 7 * 1000,
      });
    }

    router.replace("/dashboard");
  }, []);

  return <div>Setting cookies...</div>;
}
