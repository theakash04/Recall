"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ToggleTheme";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar({ animate = true }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          <Button variant={"ghost"} asChild>
            <Link
              href="/help"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Help
            </Link>
          </Button>
          <Button asChild>
            <Link href="/signin">Join Now!</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm"
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Button variant={"ghost"} asChild className="justify-center">
              <Link
                href="/help"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Help
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                Join Now!
              </Link>
            </Button>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
