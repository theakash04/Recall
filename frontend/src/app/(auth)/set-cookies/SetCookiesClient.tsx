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
        sameSite: "None",
      });
      Cookies.set("sb_refresh", refresh, {
        path: "/",
        secure: true,
        sameSite: "None",
      });
    }

    router.replace("/dashboard");
  }, []);

  return <div>Setting cookies...</div>;
}
