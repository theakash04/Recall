import React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const faqData = [
  {
    id: "faq-1",
    question: "How do I reset my password?",
    answer:
      'Click on "Forgot Password" on the login page and follow the instructions sent to your email.',
  },
  {
    id: "faq-2",
    question: "Is my data secure?",
    answer:
      "Yes, we use industry-standard encryption and security measures to protect your data.",
  },
  {
    id: "faq-3",
    question: "Can I export my data?",
    answer:
      "Yes, you can export your data at any time from your account settings.",
  },
  {
    id: "faq-4",
    question: "How do I delete my account?",
    answer:
      "Contact our support team to permanently delete your account and all associated data.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about using our platform
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/contact"
            className="bg-card rounded-lg  p-6 hover:scale-105 transition-all duration-300 transform group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                Contact Support
              </h3>
              <p className="text-muted-foreground">
                Get in touch with our support team
              </p>
            </div>
          </Link>

          <Link
            href="/feedback"
            className="bg-card rounded-lg  p-6  hover:scale-105 transition-all duration-300 transform group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                Send Feedback
              </h3>
              <p className="text-muted-foreground">
                Share your thoughts or report bugs
              </p>
            </div>
          </Link>
        </div>

        {/* Getting Started */}
        <div className="rounded-lg  p-8 mb-8  w-full">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Getting Started
          </h2>
          <div className="space-y-6">
            <div className="flex items-start group hover:bg-muted/20 p-4 rounded-lg transition-colors duration-300">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Create Your Account
                </h3>
                <p className="text-muted-foreground">
                  Sign up with your email address and verify your account to get
                  started.
                </p>
              </div>
            </div>
            <div className="flex items-start group hover:bg-muted/20 p-4 rounded-lg transition-colors duration-300">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Explore Features
                </h3>
                <p className="text-muted-foreground">
                  Browse through our main features and familiarize yourself with
                  the interface.
                </p>
              </div>
            </div>
            <div className="flex items-start group hover:bg-muted/20 p-4 rounded-lg transition-colors duration-300">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Start Using
                </h3>
                <p className="text-muted-foreground">
                  Begin utilizing the platform's features to enhance your
                  workflow and productivity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-lg  p-8 mb-8 ">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Need More Help */}
        <div className="bg-card rounded-lg p-8 text-center text-secondary-foreground">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-lg mb-6">
            Our support team is here to assist you with any questions or issues.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <a href="https://x.com/theakash04/" target="_blank">
              <Button variant={"default"} className="cursor-pointer">
                Contact Dev
              </Button>
            </a>
            <a
              href="https://github.com/theakash04/Recall/issues"
              target="_blank"
            >
              <Button variant={"secondary"} className="cursor-pointer">
                Report a Bug
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
