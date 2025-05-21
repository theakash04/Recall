"use client";
import AnimatedSection from "@/components/AnimationSection";
import FaqSection from "@/components/Faqs";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookmarkCheck, Brain, Search } from "lucide-react";
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
    title: "Save content",
    description:
      "Save any webpage, article, or document with our browser extension or mobile app.",
    icon: BookmarkCheck,
  },
  {
    title: "AI processes it",
    description:
      "Our AI reads and understands your content, creating a searchable knowledge base.",
    icon: Brain,
  },
  {
    title: "Ask anything",
    description:
      "Ask questions about your saved content and get accurate answers instantly.",
    icon: Search,
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col relative">
      {/* Header */}
      <Navbar />

      <main className="flex-1 w-full items-start flex flex-col">
        <AnimatedSection>
          {/* Hero Section */}
          <div className="max-w-4xl">
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Never forget what you read. Smart bookmarks with AI recall.
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Save articles, websites, and documents. Ask questions about them
              later. RecallMark remembers everything so you don't have to.
            </p>
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link href="/signin" className="flex items-center gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="bg-secondary mt-16 p-4 md:p-8 shadow-lg rounded-lg">
            <Image
              src="/placeholder.png"
              alt="RecallMark Interface Preview"
              width={1200}
              height={900}
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
            <div className="grid gap-8 md:grid-cols-3">
              {features.map(({ title, description, icon: Icon }, i) => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  key={title}
                  custom={i}
                  variants={fadeUp}
                  className="flex flex-col items-center text-center bg-secondary p-6 rounded-lg shadow-lg"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                  <p className="text-muted-foreground">{description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* FAQ Section */}
          <FaqSection />
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <span>Recall</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Recall. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-muted-foreground/90">
                Privacy
              </Link>
              <Link href="#" className="hover:text-muted-foreground/90">
                Open Source
              </Link>
              <Link href="#" className="hover:text-muted-foreground/90">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
