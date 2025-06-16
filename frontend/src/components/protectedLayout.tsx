"use client";
import FullScreenLoader from "@/components/Loading";
import { Sidebar } from "@/components/sidebar/Sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebarStore } from "@/store/sideBarStore";
import { useUserStore } from "@/store/useStore";
import { PanelRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import { Fragment, Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "@/lib/userApi";
import ServerErrorPage from "./serverError";
import { toast } from "sonner";
import { useGlobalStore } from "@/store/globalStore";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((seg) => seg);
  const { setUser } = useUserStore();
  const { toggleSidebar } = useSidebarStore();
  const { isServerError } = useGlobalStore();
  const router = useRouter();

  useEffect(() => {
    nProgress.start();
    nProgress.done();
  }, [pathname]);

  const {
    data: userResponse,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 15,
    retry: true,
  });

  useEffect(() => {
    if (isError && error) {
      const errorRes = !userResponse?.success && userResponse?.error;
      if (errorRes) {
        toast.warning(errorRes?.code, {
          description: errorRes.message,
        });
      }
      if ((error as any)?.status >= 400 && (error as any)?.status < 500) {
        router.replace("/signin");
      }
    }

    if (isSuccess && userResponse.success) {
      setUser(userResponse.data);
    }
  }, [isError, error, router, isSuccess]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isServerError) {
    return <ServerErrorPage />;
  }

  if (!isSuccess && !userResponse?.success && isError) {
    return <FullScreenLoader />;
  }

  let fullPath = "";

  if (isSuccess && userResponse.success) {
    return (
      <div className="flex min-h-screen relative overflow-auto scrollbar">
        <Sidebar />
        <div className="flex flex-col max-w-[100rem] mx-auto w-full">
          <main className="">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 bg-background">
              <div className="flex items-center gap-2 px-4">
                <Button onClick={() => toggleSidebar()} variant={"ghost"}>
                  <PanelRight />
                </Button>
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    {pathSegments.length > 0 && (
                      <>
                        <BreadcrumbSeparator />
                        {pathSegments.map((segment, index) => {
                          fullPath += `/${segment}`;
                          const isLast = index === pathSegments.length - 1;

                          return (
                            <Fragment key={index}>
                              <BreadcrumbItem>
                                {isLast ? (
                                  <BreadcrumbPage>
                                    {formatSegment(segment)}
                                  </BreadcrumbPage>
                                ) : (
                                  <BreadcrumbLink href={fullPath}>
                                    {formatSegment(segment)}
                                  </BreadcrumbLink>
                                )}
                              </BreadcrumbItem>
                              {!isLast && <BreadcrumbSeparator />}
                            </Fragment>
                          );
                        })}
                      </>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <Suspense fallback={<FullScreenLoader />}>
              <div key={pathname} className="h-[85vh]">
                {children}
              </div>
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  return <ServerErrorPage />;
}

function formatSegment(segment: string) {
  return segment
    .replace(/-/g, " ") // kebab-case to space
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to space
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
}
