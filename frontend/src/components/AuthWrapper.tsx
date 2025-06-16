"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchUser } from "@/lib/userApi";
import { useUserStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import FullScreenLoader from "./Loading";

const publicRoutes = ["/signin", "/", "/help"];

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser } = useUserStore();
  const isPublicRoute = publicRoutes.includes(pathname);

  const {
    data: userResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading) {
      if (userResponse?.success) {
        setUser(userResponse.data);
        if (pathname === "/signin") {
          router.push("/dashboard");
        }
      } else if (isError) {
        if (!isPublicRoute) {
          router.push("/signin");
        }
      }
    }
  }, [
    userResponse,
    isLoading,
    isError,
    pathname,
    router,
    setUser,
    isPublicRoute,
  ]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
