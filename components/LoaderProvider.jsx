"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import FramebookLoader from "@/components/FramebookLoader";

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    setReady(false);
    const timer = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (document.readyState === "complete") {
      setReady(true);
    } else {
      const onLoad = () => setReady(true);
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return (
    <>
      {loading && (
        <FramebookLoader
          color="#7C5CFC"
          bgColor="#0a0a0f"
          ready={ready}
          onDone={() => setLoading(false)}
        />
      )}
      {children}
    </>
  );
}
