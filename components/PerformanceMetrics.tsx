"use client";

import { useEffect } from "react";

export function PerformanceMetrics() {
  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const startTime = entry?.startTime;
        if (typeof startTime !== "number" || !Number.isFinite(startTime)) continue;
        if (process.env.NODE_ENV === "development") {
          console.debug("Performance entry", { name: entry.name, startTime });
        }
      }
    });

    observer.observe({ type: "navigation", buffered: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
