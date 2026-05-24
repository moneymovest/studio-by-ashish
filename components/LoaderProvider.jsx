"use client";

import { useState, useEffect } from "react";
import FramebookLoader from "@/components/FramebookLoader";

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(
    () => typeof document !== "undefined" && document.readyState === "complete",
  );

  useEffect(() => {
    if (typeof document !== "undefined" && document.readyState === "complete") {
      return;
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
