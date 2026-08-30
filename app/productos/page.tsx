import { AnimatedPage } from "@/components/AnimatedPage";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteChrome } from "@/components/SiteChrome";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ProductCatalog } from "@/sections/ProductCatalog";

export default function ProductsPage() {
  return <>
    <div className="noise" aria-hidden="true" />
    <SmoothScroll />
    <CustomCursor />
    <SiteChrome />
    <AnimatedPage><ProductCatalog /></AnimatedPage>
  </>;
}