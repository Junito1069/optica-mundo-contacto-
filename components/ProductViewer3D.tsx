"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

type Vector3 = [number, number, number];

export type ProductViewer3DProps = {
  model?: string;
  scale?: number;
  position?: Vector3;
  rotation?: Vector3;
  autoRotate?: boolean;
  interactive?: boolean;
  className?: string;
};

function ModelAsset({ model, scale, position, rotation }: Required<Pick<ProductViewer3DProps, "model" | "scale" | "position" | "rotation">>) {
  const asset = useGLTF(model);
  return <primitive object={asset.scene.clone()} scale={scale} position={position} rotation={rotation} />;
}

export function ProductViewer3D({ model, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], autoRotate = false, interactive = true, className }: ProductViewer3DProps) {
  if (!model) return null;
  return <div className={className} aria-label="Interactive 3D product viewer"><Canvas camera={{ position: [0, 0, 5], fov: 42 }} dpr={[1, 1.5]}><ambientLight intensity={1.2} /><directionalLight position={[4, 5, 5]} intensity={2} /><Suspense fallback={null}><ModelAsset model={model} scale={scale} position={position} rotation={rotation} /></Suspense>{interactive && <OrbitControls enablePan={false} autoRotate={autoRotate} autoRotateSpeed={0.8} />}</Canvas></div>;
}