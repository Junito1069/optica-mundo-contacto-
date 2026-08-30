"use client";

import { useLayoutEffect, useRef } from "react";
import { createHeroEntranceAnimation } from "@/animations/heroAnimations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { InteractiveEye } from "@/components/InteractiveEye";

export function Hero() {
  const scope = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (!scope.current || reducedMotion) return;
    return createHeroEntranceAnimation(scope.current);
  }, [reducedMotion]);

  return <section ref={scope} className="hero" id="home" aria-labelledby="hero-title">
    <div className="hero-meta hero-meta-left" data-hero-meta>VISIÓN Y CUIDADO<br />ESPECIALIZADO</div><div className="hero-meta hero-meta-right" data-hero-meta>01 / 04<br />MUNDO CONTACTO</div>
    <div className="hero-copy" data-hero-copy><p className="eyebrow">MUNDO CONTACTO / SALUD VISUAL</p><h1 id="hero-title">TU VISIÓN,<br /><em>NUESTRA PRIORIDAD.</em></h1><p className="hero-description">Lentes de contacto originales y asesoría profesional para una visión cómoda, clara y segura.</p><div className="hero-actions"><a className="primary-action" href="#productos" data-cursor="explore">VER PRODUCTOS</a><a className="line-link" href="https://wa.me/18090000000?text=Hola%2C%20necesito%20asesor%C3%ADa%20para%20lentes%20de%20contacto." target="_blank" rel="noreferrer" data-cursor="explore">HABLAR POR WHATSAPP <span>↗</span></a></div></div>
    <InteractiveEye /><div className="scroll-prompt"><span /> DESCUBRE MÁS</div>
  </section>;
}