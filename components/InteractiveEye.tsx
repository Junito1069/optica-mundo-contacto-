"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function InteractiveEye() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<SVGSVGElement>(null);
  const eyeRef = useRef<SVGGElement>(null);
  const irisRef = useRef<SVGGElement>(null);
  const pupilRef = useRef<SVGGElement>(null);
  const highlightRef = useRef<SVGGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0, proximity: 0 });
  const current = useRef({ x: 0, y: 0 });
  const lastPointerMove = useRef(0);
  const reducedMotion = useReducedMotion();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  useEffect(() => {
    if (reducedMotion) return;
    let blinkTimer = 0;
    let closeTimer = 0;
    const blink = () => {
      artRef.current?.classList.add("is-blinking");
      closeTimer = window.setTimeout(() => artRef.current?.classList.remove("is-blinking"), 390);
      const nextBlink = 3200 + Math.random() * 3800;
      blinkTimer = window.setTimeout(blink, nextBlink);
    };
    blinkTimer = window.setTimeout(blink, 3200 + Math.random() * 3800);
    return () => { window.clearTimeout(blinkTimer); window.clearTimeout(closeTimer); };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !finePointer) return;

    let frameId = 0;
    const onPointerMove = (event: PointerEvent) => {
      const bounds = artRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const x = (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2);
      const y = (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2);
      const distance = Math.max(1, Math.hypot(x, y));
      const clampedX = x / distance;
      const clampedY = y / distance;
      const svgScale = bounds.width / 500;
      const limitX = Math.min(17, Math.max(10, bounds.width * .028)) / svgScale;
      const limitY = Math.min(10, Math.max(6, bounds.height * .028)) / svgScale;
      const pixelDistance = Math.hypot(event.clientX - (bounds.left + bounds.width / 2), event.clientY - (bounds.top + bounds.height / 2));
      target.current = { x: clampedX * limitX, y: clampedY * limitY, proximity: Math.max(0, 1 - pixelDistance / (bounds.width * .75)) };
      lastPointerMove.current = performance.now();
    };
    const resetPointer = () => { target.current = { x: 0, y: 0, proximity: 0 }; lastPointerMove.current = 0; };
    const onWindowOut = (event: MouseEvent) => { if (!event.relatedTarget) resetPointer(); };
    const animate = () => {
      const idleTime = lastPointerMove.current ? performance.now() - lastPointerMove.current : 0;
      const idleWeight = idleTime > 1200 ? Math.min(1, (idleTime - 1200) / 900) : 0;
      const idleX = Math.sin(performance.now() / 2200) * 1.15 * idleWeight;
      const idleY = Math.cos(performance.now() / 2900) * .65 * idleWeight;
      const desiredX = target.current.x + idleX;
      const desiredY = target.current.y + idleY;
      current.current.x += (desiredX - current.current.x) * .105;
      current.current.y += (desiredY - current.current.y) * .105;
      const { x, y } = current.current;
      irisRef.current?.setAttribute("transform", `translate(${x} ${y})`);
      pupilRef.current?.setAttribute("transform", `translate(${x * 1.05} ${y * 1.05})`);
      highlightRef.current?.setAttribute("transform", `translate(${x * 1.1} ${y * 1.1})`);
      eyeRef.current?.setAttribute("transform", `translate(${x * .06} ${y * .06})`);
      if (glowRef.current) {
        glowRef.current.style.opacity = `${.5 + target.current.proximity * .13}`;
        glowRef.current.style.transform = `translate3d(${x * .15}px, ${y * .15}px, 0)`;
      }
      frameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("mouseout", onWindowOut);
    frameId = window.requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("mouseout", onWindowOut);
      window.cancelAnimationFrame(frameId);
    };
  }, [finePointer, reducedMotion]);

  const reactToClick = () => {
    if (reducedMotion) return;
    const scene = sceneRef.current;
    if (!scene) return;
    scene.classList.remove("is-reacting");
    window.requestAnimationFrame(() => scene.classList.add("is-reacting"));
    window.setTimeout(() => scene.classList.remove("is-reacting"), 500);
  };

  return <div ref={sceneRef} className="interactive-eye" data-hero-stage data-cursor="explore" aria-hidden="true" onClick={reactToClick}>
    <div ref={glowRef} className="eye-glow" data-eye-glow aria-hidden="true" />
    <span className="eye-particle particle-one" aria-hidden="true" /><span className="eye-particle particle-two" aria-hidden="true" /><span className="eye-particle particle-three" aria-hidden="true" />
    <svg ref={artRef} className="eye-art" viewBox="0 0 500 330" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="iris-gradient" cx="0" cy="0" r="1" gradientTransform="translate(230 120) rotate(57) scale(146)"><stop stopColor="#B9DCFF" /><stop offset=".42" stopColor="#438FE4" /><stop offset=".78" stopColor="#0B5ED7" /><stop offset="1" stopColor="#083B8C" /></radialGradient>
        <linearGradient id="sclera-gradient" x1="250" y1="70" x2="250" y2="270" gradientUnits="userSpaceOnUse"><stop stopColor="#FFFFFF" /><stop offset="1" stopColor="#EAF3FF" /></linearGradient>
        <filter id="eye-shadow" x="40" y="38" width="420" height="258" filterUnits="userSpaceOnUse"><feDropShadow dx="0" dy="18" stdDeviation="15" floodColor="#083B8C" floodOpacity=".16" /></filter>
        <clipPath id="eye-clip"><path d="M65 165C111 89 176 58 250 58C324 58 389 89 435 165C389 241 324 272 250 272C176 272 111 241 65 165Z" /></clipPath>
      </defs>
      <g ref={eyeRef} filter="url(#eye-shadow)">
        <path d="M65 165C111 89 176 58 250 58C324 58 389 89 435 165C389 241 324 272 250 272C176 272 111 241 65 165Z" fill="url(#sclera-gradient)" stroke="#A9CBEF" strokeWidth="3" />
        <g clipPath="url(#eye-clip)"><g ref={irisRef}><circle cx="250" cy="165" r="91" fill="url(#iris-gradient)" /><circle cx="250" cy="165" r="65" stroke="#D9ECFF" strokeOpacity=".55" strokeWidth="2" /></g><g ref={pupilRef}><circle cx="250" cy="165" r="40" fill="#0B1F3A" /><circle cx="250" cy="165" r="22" fill="#06142A" /></g><g ref={highlightRef}><circle cx="224" cy="133" r="13" fill="white" fillOpacity=".9" /><circle cx="240" cy="149" r="5" fill="white" fillOpacity=".58" /></g></g>
        <path className="eye-lid" d="M65 165C111 89 176 58 250 58C324 58 389 89 435 165C389 241 324 272 250 272C176 272 111 241 65 165Z" fill="#F4F8FF" />
        <path d="M65 165C111 89 176 58 250 58C324 58 389 89 435 165C389 241 324 272 250 272C176 272 111 241 65 165Z" stroke="#0B5ED7" strokeOpacity=".38" strokeWidth="3" />
      </g>
    </svg>
    <span className="eye-caption eye-caption-left"><i /> TECNOLOGÍA VISUAL</span><span className="eye-caption eye-caption-right"><i /> CUIDADO PRECISO</span>
    <span className="eye-index">MC-01</span><span className="eye-ripple" aria-hidden="true" />
  </div>;
}