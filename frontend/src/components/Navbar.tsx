"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ToggleTheme";

export default function Navbar({ animate = true }) {
  return (
    <motion.header
      initial={animate ? { opacity: 0, y: -20 } : {}}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      id="header"
      role="banner"
      aria-label="Recall Header"
      data-theme="dark"
      data-scroll-sticky
      data-scroll-target="#header"
      className="border-b border-border sticky top-0 z-50 bg-background/50 backdrop-blur-sm"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <span>Recall</span>
        </Link>
        <nav className="flex items-center gap-6">
          <ThemeToggle />
          <Button asChild>
            <Link href="/signin">Join Now!</Link>
          </Button>
        </nav>
      </div>
    </motion.header>
  );
}
