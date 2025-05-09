"use client";
import { useUserStore } from "@/store/useStore";
import { user } from "@/types/userTypes";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function Guard({ children }: { children: React.ReactNode }) {
  const { setUser } = useUserStore();
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get<user>(
          `${process.env.NEXT_PUBLIC_SERVER_API}/auth/get-user`,
          { withCredentials: true }
        );
        if (res.status < 400 && res.data) {
          setUser(res.data);
          if (pathname === "/" || pathname === "/signin") {
            router.replace("/dashboard");
          }
        } else {
          throw new Error();
        }
      } catch {
        toast("Unauthorized user!");
        if (pathname.startsWith("/dashboard")) {
          router.replace("/signin");
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router, setUser]);

  // Don't render children while auth is being checked
  if (isChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 h-12 w-12" />
        <span className="ml-4 text-gray-600 text-sm">Checking authentication...</span>
      </div>
    );
  }

  return <>{children}</>;
}

export default Guard;

