import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Points, PointMaterial } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
const GlobePoints = () => {
    const pointsRef = useRef(null);
    // Generate random points on a sphere
    const positions = useMemo(() => {
        const count = 3000; // Increased count for better density
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            const radius = 2.6; // Slightly larger than core
            pos[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
            pos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            pos[i * 3 + 2] = radius * Math.cos(phi);
        }
        return pos;
    }, []);
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
            pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.04;
            // Subtle pulse effect
            const s = 1 + Math.sin(state.clock.getElapsedTime() * 0.4) * 0.03;
            pointsRef.current.scale.set(s, s, s);
        }
    });
    return (_jsx(Points, { ref: pointsRef, positions: positions, stride: 3, children: _jsx(PointMaterial, { transparent: true, color: "#60a5fa" // Brighter blue
            , size: 0.025, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 }) }));
};
const GlobeCore = () => {
    const meshRef = useRef(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;
        }
    });
    return (_jsx(Float, { speed: 1.5, rotationIntensity: 0.3, floatIntensity: 0.3, children: _jsx(Sphere, { ref: meshRef, args: [2.2, 64, 64], children: _jsx(MeshDistortMaterial, { color: "#1e40af" // Deep blue
                , roughness: 0.2, metalness: 0.9, distort: 0.4, speed: 1.5, transparent: true, opacity: 0.5, emissive: "#1e3a8a", emissiveIntensity: 0.5 }) }) }));
};
export const Globe = () => {
    return (_jsxs("div", { className: "w-full h-full absolute inset-0 -z-10", children: [_jsxs(Canvas, { camera: { position: [0, 0, 7], fov: 45 }, dpr: [1, 2], children: [_jsx("color", { attach: "background", args: ['#000000'] }), _jsx("ambientLight", { intensity: 0.4 }), _jsx("pointLight", { position: [10, 10, 10], intensity: 1.5, color: "#3b82f6" }), _jsx("pointLight", { position: [-10, -10, -10], intensity: 0.8, color: "#1e3a8a" }), _jsx(GlobeCore, {}), _jsx(GlobePoints, {}), _jsx(EffectComposer, { children: _jsx(Bloom, { luminanceThreshold: 0.1, mipmapBlur: true, intensity: 1.2, radius: 0.4 }) })] }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" })] }));
};
