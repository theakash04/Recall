import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import QueryProvider from "@/components/QueryPrvider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Recall - Smart Bookmark Manager",
    template: "%s | Recall",
  },
  description:
    "Never forget what you read. Smart bookmarks with AI recall. Bookmark articles and websites, find them using any words you remember.",
  keywords: [
    "bookmark manager",
    "AI search",
    "productivity",
    "knowledge management",
  ],
  authors: [{ name: "Akash", url: "https://akashtwt.me" }],
  creator: "Akash",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://recall.com",
    siteName: "Recall",
    title: "Recall - Smart Bookmark Manager",
    description: "Never forget what you read. Smart bookmarks with AI recall.",
    images: [
      {
        url: "/placeholder-dark.png",
        width: 1200,
        height: 630,
        alt: "Recall - Smart Bookmark Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recall - Smart Bookmark Manager",
    description: "Never forget what you read. Smart bookmarks with AI recall.",
    creator: "@theakash04",
    images: [
      {
        url: "/placeholder-dark.png",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
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
            <main>{children}</main>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
