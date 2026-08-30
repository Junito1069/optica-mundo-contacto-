import { AnimatedPage } from "@/components/AnimatedPage";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteChrome } from "@/components/SiteChrome";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CategoryCatalog } from "@/sections/CategoryCatalog";

export default function CategoriesPage() {
  return <>
    <div className="noise" aria-hidden="true" />
    <SmoothScroll />
    <CustomCursor />
    <SiteChrome />
    <AnimatedPage><CategoryCatalog /></AnimatedPage>
  </>;
}