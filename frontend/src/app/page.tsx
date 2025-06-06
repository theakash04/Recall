"use client";
import AnimatedSection from "@/components/AnimationSection";
import FullScreenLoader from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUserTestimonials } from "@/lib/userApi";
import { ApiResponse } from "@/types/apiResponse";
import { testimonials } from "@/types/userTypes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Bookmark, Search, Zap, Star } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const features = [
  {
    title: "Smart Bookmarking",
    description:
      "Simply paste any URL and our system automatically scrapes and saves the content from blogs, articles, and documentation.",
    icon: Bookmark,
  },
  {
    title: "Intelligent Search",
    description:
      "Find your saved content using keyword search, semantic search, or hybrid search - even when you only remember vague details.",
    icon: Search,
  },
  {
    title: "Lightning Fast",
    description:
      "Get instant results from hundreds or thousands of saved articles. No more scrolling through endless bookmarks.",
    icon: Zap,
  },
];

export default function HomePage() {
  const {
    data: testimonialResponse,
    isLoading,
    isError,
  } = useQuery<ApiResponse<testimonials[]>>({
    queryKey: ["testimonials"],
    queryFn: getUserTestimonials,
  });

  const testimonials = testimonialResponse?.success
    ? testimonialResponse.data
    : [];

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="flex min-h-screen flex-col relative bg-background overflow-x-hidden">
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
              Save articles, websites, and documents. Ask questions about them
              later. Recall remembers everything so you don't have to.
            </p>
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link href="/signin" className="flex items-center gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* image section to preview website! */}
          <div className="bg-muted/50 mt-16 p-4 md:p-8 shadow-lg rounded-lg border">
            <Image
              src="/placeholder.png"
              alt="RecallMark Interface Preview"
              width={1200}
              height={900}
              priority
              className="rounded-md shadow-md object-contain aspect-video"
            />
          </div>

          {/* Features Section */}
          <motion.section
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="container mx-auto px-4 py-20"
          >
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl text-foreground">
              How it works
            </h2>
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon }, i) => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  key={title}
                  custom={i}
                  variants={fadeUp}
                  className="flex flex-col items-center text-center bg-card p-6 rounded-lg shadow-lg border"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-muted-foreground">{description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* User Testimonials Section */}
          <div className={`w-full bg-muted/30 ${!isError ? "pt-10" : "py-10"}`}>
            <div
              className={`container mx-auto px-4 ${
                !isError ? "mb-12" : "mb-5"
              }`}
            >
              <h2 className="text-center text-3xl font-bold md:text-4xl text-foreground mb-4">
                Loved by readers worldwide
              </h2>
              <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                Join thousands of students, researchers, and professionals who
                never lose track of important content again.
              </p>
            </div>

            {/* Only show animated testimonials if we have 5 or more */}
            {testimonials && testimonials.length >= 5 && (
              <div className="relative overflow-hidden w-full">
                {/* Fade overlays */}
                <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />

                <motion.div
                  className="flex gap-6"
                  animate={{
                    x: [0, -(380 + 24) * testimonials.length],
                  }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 40,
                      ease: "linear",
                    },
                  }}
                  style={{ width: "fit-content" }}
                >
                  {[...testimonials, ...testimonials, ...testimonials].map(
                    (testimonial, index) => (
                      <motion.div
                        key={index}
                        className="w-[380px] bg-card p-6 rounded-lg shadow-md border flex-shrink-0"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: (index % testimonials.length) * 0.1,
                        }}
                        whileHover={{
                          scale: 1.02,
                          y: -5,
                          transition: { duration: 0.2 },
                        }}
                      >
                        {/* User Profile & Name */}
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <Avatar className="h-full w-full">
                              <AvatarImage
                                src={testimonial.user.avatar_url}
                                alt={testimonial.user.name}
                              />
                              <AvatarFallback>
                                {testimonial.user.name
                                  ? testimonial.user.name
                                      .charAt(0)
                                      .toUpperCase()
                                  : "U"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {testimonial.user.name}
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                delay:
                                  0.1 * i +
                                  (index % testimonials.length) * 0.05,
                                duration: 0.3,
                              }}
                            >
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            </motion.div>
                          ))}
                        </div>

                        {/* Feedback */}
                        <p className="text-foreground italic leading-relaxed">
                          "{testimonial.feedback}"
                        </p>
                      </motion.div>
                    )
                  )}
                </motion.div>
              </div>
            )}
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
