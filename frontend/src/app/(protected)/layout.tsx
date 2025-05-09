"use client";
import Guard from "@/components/CheackUserAuth";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

export default function Protected({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((seg) => seg);

  let fullPath = "";

  return (
    <Guard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col max-w-[100rem] mx-auto w-full relative">
            <main className="">
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <Breadcrumb>
                    <BreadcrumbList>
                      {pathSegments.length > 0 &&
                        (
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

              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="h-[85vh]"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Guard>
  );
}

function formatSegment(segment: string) {
  return segment
    .replace(/-/g, " ") // kebab-case to space
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to space
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
}
