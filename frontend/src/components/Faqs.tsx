"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Intelligent recall",
    answer:
      "Don't just save links—save knowledge. Ask questions about your content in natural language.",
  },
  {
    question: "Content preservation",
    answer:
      "We save the actual content, so even if websites change or disappear, your information remains.",
  },
  {
    question: "Cross-platform",
    answer:
      "Access your knowledge base from any device—desktop, mobile, or tablet.",
  },
  {
    question: "Powerful search",
    answer:
      "Find exactly what you're looking for with semantic search that understands context.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="container px-4 w-full py-6">
      <h2 className="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl w-full">
        Why this is better than browser bookmarks?
      </h2>

      <div className="mx-auto divide-y divide-border rounded-md border border-border bg-background shadow-sm w-full">
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className=""
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <AccordionTrigger className="flex items-center justify-between p-4 text-left text-lg font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-offset-2 cursor-pointer">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="p-4 text-sm text-muted-foreground text-start">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
