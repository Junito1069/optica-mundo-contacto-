"use client";

import dynamic from "next/dynamic";

export const ProductViewer3DDynamic = dynamic(() => import("@/components/ProductViewer3D").then((module) => module.ProductViewer3D), { ssr: false, loading: () => null });