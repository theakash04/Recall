"use client";

import ProtectedLayout from "@/components/protectedLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

export default function ProtectedWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={client}>
      <ProtectedLayout>{children}</ProtectedLayout>
    </QueryClientProvider>
  );
}
