import { AnimatedPage } from "@/components/AnimatedPage";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteChrome } from "@/components/SiteChrome";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CollectionSection } from "@/sections/CollectionSection";
import { Hero } from "@/sections/Hero";
import { IntroSection } from "@/sections/IntroSection";
import { Manifesto } from "@/sections/Manifesto";

export default function HomePage() {
  return <>
    <div className="noise" aria-hidden="true" />
    <SmoothScroll />
    <CustomCursor />
    <SiteChrome />
    <AnimatedPage><Hero /><IntroSection /><CollectionSection /><Manifesto /></AnimatedPage>
  </>;
}