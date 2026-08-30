import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function createHeroEntranceAnimation(scope: HTMLElement) {
  const context = gsap.context(() => {
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline.fromTo("[data-eye-glow]", { autoAlpha: 0, scale: 0.82 }, { autoAlpha: 0.65, scale: 1, duration: 0.7 }).fromTo("[data-hero-stage]", { x: 32, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.9 }, "<0.08").fromTo(".eye-art", { scale: 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9 }, "<0.1").from("[data-hero-copy] .eyebrow, [data-hero-copy] h1, [data-hero-copy] .hero-description", { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.58 }, "<0.12").from("[data-hero-copy] .hero-actions", { y: 12, autoAlpha: 0, duration: 0.45 }, "<0.08").from("[data-hero-meta]", { autoAlpha: 0, duration: 0.4 }, "<0.12");
    gsap.to("[data-hero-stage]", { y: -14, scale: 0.985, ease: "none", scrollTrigger: { trigger: scope, start: "top top", end: "bottom top", scrub: true } });
  }, scope);
  return () => context.revert();
}