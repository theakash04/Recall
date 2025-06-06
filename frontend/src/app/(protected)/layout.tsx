"use client";

import ProtectedLayout from "@/components/protectedLayout";


export default function ProtectedWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <ProtectedLayout>{children}</ProtectedLayout>
  );
}
