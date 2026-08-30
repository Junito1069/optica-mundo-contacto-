"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type LensConfig = {
  id: string;
  depth: number;
  originX: number;
  originY: number;
  className: string;
  label: string;
};

const lenses: LensConfig[] = [
  { id: "primary", depth: 1, originX: 0.56, originY: 0.47, className: "contact-lens-primary", label: "Lente de contacto principal" },
  { id: "secondary-left", depth: 0.56, originX: 0.23, originY: 0.68, className: "contact-lens-secondary contact-lens-left", label: "Lente de contacto secundario" },
  { id: "secondary-right", depth: 0.34, originX: 0.82, originY: 0.25, className: "contact-lens-secondary contact-lens-right", label: "Lente de contacto secundario" },
];

export function ContactLensScene() {
  const scene = useRef<HTMLDivElement>(null);
  const lensNodes = useRef<Record<string, HTMLButtonElement | null>>({});
  const highlightNodes = useRef<Record<string, HTMLSpanElement | null>>({});
  const pointer = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  useEffect(() => {
    if (reducedMotion || !finePointer) return;

    const animate = () => {
      current.current.x += (pointer.current.x - current.current.x) * 0.075;
      current.current.y += (pointer.current.y - current.current.y) * 0.075;

      lenses.forEach((lens) => {
        const node = lensNodes.current[lens.id];
        const highlight = highlightNodes.current[lens.id];
        if (!node) return;

        const distance = Math.hypot(pointer.current.x - lens.originX + 0.5, pointer.current.y - lens.originY + 0.5);
        const magneticForce = Math.max(0, 1 - distance / 0.35) * lens.depth;
        const x = current.current.x * 26 * lens.depth + (pointer.current.x - lens.originX + 0.5) * 10 * magneticForce;
        const y = current.current.y * 18 * lens.depth + (pointer.current.y - lens.originY + 0.5) * 8 * magneticForce;
        const rotationX = current.current.y * -8 * lens.depth;
        const rotationY = current.current.x * 10 * lens.depth;
        const scale = 1 + magneticForce * 0.04;

        node.style.transform = `translate3d(${x}px, ${y}px, 0) rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scale})`;
        if (highlight) highlight.style.transform = `translate3d(${current.current.x * 18}px, ${current.current.y * 14}px, 2px)`;
      });

      frame.current = window.requestAnimationFrame(animate);
    };

    frame.current = window.requestAnimationFrame(animate);
    return () => {
      if (frame.current) window.cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [finePointer, reducedMotion]);

  const moveScene = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!finePointer || reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: (event.clientX - bounds.left) / bounds.width - 0.5,
      y: (event.clientY - bounds.top) / bounds.height - 0.5,
    };
  };

  const resetScene = () => {
    pointer.current = { x: 0, y: 0 };
  };

  const reactToPress = (id: string) => {
    const lens = lensNodes.current[id];
    if (!lens) return;
    lens.classList.remove("is-pressed");
    window.requestAnimationFrame(() => lens.classList.add("is-pressed"));
    window.setTimeout(() => lens.classList.remove("is-pressed"), 620);
  };

  return <div ref={scene} className="contact-lens-scene" data-hero-stage data-cursor="explore" aria-label="Escena interactiva de lentes de contacto" onPointerMove={moveScene} onPointerLeave={resetScene}>
    <div className="lens-glow" data-lens-glow aria-hidden="true" />
    <div className="lens-particles" data-lens-particles aria-hidden="true"><i /><i /><i /><i /><i /></div>
    {lenses.map((lens) => <button key={lens.id} ref={(node) => { lensNodes.current[lens.id] = node; }} type="button" className={`contact-lens ${lens.className}`} data-hero-lens aria-label={lens.label} onClick={() => reactToPress(lens.id)}>
      <span className="lens-surface"><span ref={(node) => { highlightNodes.current[lens.id] = node; }} className="lens-highlight" /><span className="lens-ripple" /></span>
    </button>)}
    <span className="lens-caption lens-caption-left"><i /> HIDRATACIÓN CONTINUA</span>
    <span className="lens-caption lens-caption-right"><i /> PRECISIÓN ÓPTICA</span>
    <span className="lens-index">MC-01</span>
  </div>;
}