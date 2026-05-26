"use client";

import { useState, useEffect } from "react";
import FramebookLoader from "@/components/FramebookLoader";

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (document.readyState !== "loading") {
      const timer = window.setTimeout(() => setReady(true), 0);
      return () => window.clearTimeout(timer);
    }

    const onLoad = () => setReady(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
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
