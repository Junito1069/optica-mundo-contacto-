"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const labels: Record<string, string> = { view: "VIEW", drag: "DRAG", explore: "EXPLORE" };

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const canUseCursor = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!canUseCursor || reducedMotion) return;
    const onMove = (event: PointerEvent) => {
      const transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      if (dotRef.current) dotRef.current.style.transform = transform;
      if (labelRef.current) labelRef.current.style.transform = transform;
    };
    const onEnter = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      if (labelRef.current) labelRef.current.textContent = labels[target.dataset.cursor ?? "view"] ?? "VIEW";
      document.body.classList.add("cursor-active");
    };
    const onLeave = () => document.body.classList.remove("cursor-active");
    const targets = [...document.querySelectorAll<HTMLElement>("a, button, [data-cursor]")];
    window.addEventListener("pointermove", onMove);
    targets.forEach((target) => { target.addEventListener("pointerenter", onEnter); target.addEventListener("pointerleave", onLeave); });
    document.body.classList.add("has-custom-cursor");
    return () => {
      window.removeEventListener("pointermove", onMove);
      targets.forEach((target) => { target.removeEventListener("pointerenter", onEnter); target.removeEventListener("pointerleave", onLeave); });
      document.body.classList.remove("has-custom-cursor", "cursor-active");
    };
  }, [canUseCursor, reducedMotion]);

  return <><div ref={dotRef} className="cursor-dot" aria-hidden="true" /><div ref={labelRef} className="cursor-label" aria-hidden="true">VIEW</div></>;
}