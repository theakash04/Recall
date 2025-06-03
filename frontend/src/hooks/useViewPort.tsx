"use client";
import { useEffect, useState } from "react";

export default function useViewport() {
  const [viewport, setViewport] = useState<"mobile" | "desktop" | "large">(
    "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 750) {
        setViewport("mobile");
      } else if (width >= 750 && width < 1700) {
        setViewport("desktop");
      } else {
        setViewport("large");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return viewport;
}
