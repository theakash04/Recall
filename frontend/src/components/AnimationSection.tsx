"use client";

import { motion } from "motion/react";
import { PropsWithChildren } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function AnimatedSection({ children }: PropsWithChildren) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="container py-10 mx-auto px-4 text-center flex flex-col items-center"
    >
      {children}
    </motion.section>
  );
}
