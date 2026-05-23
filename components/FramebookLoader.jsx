"use client";

import { useEffect, useMemo, useState } from "react";

export default function FramebookLoader({
  color = "#7C5CFC",
  bgColor = "#0a0a0f",
  ready = false,
  onDone,
}) {
  const [phase, setPhase] = useState("intro");
  const [visible, setVisible] = useState(true);

  const accentStyle = useMemo(
    () => ({
      color,
      borderColor: `${color}33`,
      boxShadow: `0 0 60px ${color}22`,
    }),
    [color],
  );

  useEffect(() => {
    const introTimer = window.setTimeout(() => setPhase("idle"), 700);
    return () => window.clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (!ready) {
      setPhase("idle");
      return;
    }

    setPhase("exit");
    const exitTimer = window.setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 320);

    return () => window.clearTimeout(exitTimer);
  }, [ready, onDone]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,92,252,0.22),transparent_35%),radial-gradient(circle_at_center,rgba(56,189,248,0.16),transparent_30%)] opacity-90" />
      <div
        className="relative flex flex-col items-center gap-5 rounded-[2rem] border bg-white/5 px-8 py-10 backdrop-blur-2xl"
        style={accentStyle}
      >
        <div
          className={`h-14 w-14 rounded-full border-2 ${
            phase === "intro" ? "animate-pulse" : "animate-spin"
          }`}
          style={{ borderColor: color }}
        />
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.42em] text-white/60">
            Framebook
          </p>
          <p className="mt-2 text-lg font-medium text-white/90">
            {phase === "exit"
              ? "Opening your workspace"
              : "Preparing the experience"}
          </p>
        </div>
      </div>
    </div>
  );
}
