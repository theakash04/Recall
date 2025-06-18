"use client";
import AnimatedSection from "@/components/AnimationSection";
import FullScreenLoader from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUserTestimonials } from "@/utils/userApi";
import { ApiResponse } from "@/types/apiResponse";
import { testimonials } from "@/types/userTypes";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col  bg-background overflow-x-hidden">
      {/* Header */}
      <Navbar />
      <main className="flex-1 w-full items-start flex flex-col">
        <AnimatedSection>
          {/* Hero Section */}
          <div className="max-w-4xl">
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-foreground">
              Never forget what you read. Smart bookmarks with AI recall.
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Bookmark articles and websites freely. Find them using any words
              you remember about the content, not just exact titles. Recall's
              smart search makes rediscovering bookmarks effortless.
            </p>
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link href="/signin" className="flex items-center gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* image section to preview website! */}
          <div className="bg-muted/50 mt-16 p-4 md:p-4 shadow-lg rounded-lg border">
            <Image
              src={
                theme === "dark"
                  ? "/placeholder-dark.png"
                  : "/placeholder-light.png"
              }
              alt="RecallMark Interface Preview"
              width={1200}
              height={900}
              priority
              className="rounded-md shadow-md object-contain aspect-video transition-all"
            />
          </div>

          {/* User Testimonials Section */}
          <div className={`w-full bg-muted/30 pt-10 mt-10`}>
            <div className={`container mx-auto px-4 mb-5`}>
              <h2 className="text-center text-3xl font-bold md:text-4xl text-foreground mb-4">
                Loved by readers worldwide
              </h2>
              <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                Join thousands of students, researchers, and professionals who
                never lose track of important content again.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <span>Recall</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Recall. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a
                href="https://github.com/theakash04/recall"
                target="_blank"
                className="hover:text-muted-foreground/90"
              >
                Open Source
              </a>
              <Link href="/help" className="hover:text-muted-foreground/90">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
