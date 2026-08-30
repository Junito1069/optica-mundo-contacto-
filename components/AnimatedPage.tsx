"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { createRevealAnimations } from "@/animations/scrollAnimations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function AnimatedPage({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (!scope.current || reducedMotion) return;
    return createRevealAnimations(scope.current);
  }, [reducedMotion]);

  return <main ref={scope}>{children}</main>;
}