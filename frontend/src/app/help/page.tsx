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
    question: "What is Recall and how does it work?",
    answer:
      "Recall is a smart bookmark manager that organizes your links and helps you find them instantly with powerful search capabilities.",
  },
  {
    id: "faq-2",
    question: "Can I access my data from multiple devices?",
    answer:
      "Yes, your data is synced across all devices. Simply sign in with the same account on any device to access your information.",
  },
  {
    id: "faq-3",
    question: "Is my data secure?",
    answer:
      "Yes, we use industry-standard encryption and security measures to protect your data.",
  },
  {
    id: "faq-4",
    question: "How do I delete my account?",
    answer:
      "Navigate to Settings from your dashboard, scroll down to the 'Danger Zone' section, and click on 'Delete Account'. Please note this action is permanent and cannot be undone.",
  },
  {
    id: "faq-5",
    question: "How can I provide feedback or report bugs?",
    answer:
      "You can send feedback through our feedback form, contact us on Twitter @theakash04, or report bugs directly on our GitHub repository.",
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
        <div className="mb-12 flex flex-row w-full items-center justify-center">
          <Link
            href="/feedback"
            className="bg-card rounded-lg  p-6  hover:scale-105 transition-all duration-300 transform group max-w-4xl w-full"
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
                  sign up with your google Account!
                </p>
              </div>
            </div>
            <div className="flex items-start group hover:bg-muted/20 p-4 rounded-lg transition-colors duration-300">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Add bookmarks and search
                </h3>
                <p className="text-muted-foreground">
                  Add bookmarks though links and search from multiple bookmarks
                  easily with smart search engine.
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
            <a
              href="https://github.com/theakash04/Recall/issues"
              target="_blank"
            >
              <Button variant={"default"} className="cursor-pointer">
                Report a Bug
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
