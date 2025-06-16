import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import QueryProvider from "@/components/QueryPrvider";
import AuthWrapper from "@/components/AuthWrapper";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recall",
  description:
    "Save articles, websites, and documents. Ask questions about them later. Recall remembers everything so you don't have to.",
  authors: [{ name: "Akash", url: "https://akashtwt.me" }],
  category: "utility",
  keywords: [
    "bookmark manager",
    "knowledge management",
    "save articles",
    "document storage",
    "AI search",
    "productivity tool",
    "web clipper",
    "note taking",
  ],
  applicationName: "Recall",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased scrollbar`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <QueryProvider>
            <AuthWrapper>
              <main>{children}</main>
            </AuthWrapper>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
