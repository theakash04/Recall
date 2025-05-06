import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";

export default function Navbar({ animate = true }) {
  const [authenticated, setAuthenticated] = useState(false);

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
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <span>Recall</span>
        </div>
        <nav className="flex items-center gap-6">
          {authenticated ? (
            <>
              <Button
                type="button"
                variant={"destructive"}
                size={"default"}
                className="cursor-pointer hover:bg-destructive/80"
                onClick={() => setAuthenticated(false)}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-foreground hover:text-foreground/90"
              >
                Login
              </Link>
              <Button asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
