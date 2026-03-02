"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { HexaMetrics } from '@/lib/hexa-engine';

interface HexaSpace3DProps {
  metrics: HexaMetrics;
}

const DataPoint = ({ position, color, label }: { position: [number, number, number], color: string, label: string }) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

const SignificanceCore = ({ metrics }: { metrics: HexaMetrics }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Mapeia as métricas para escala e distorção
  const scale = 1 + (metrics.contextualDensity + metrics.semanticResonance) / 2;
  const speed = 2 + metrics.informationalEntropy * 5;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} scale={[scale, scale, scale]}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color={new THREE.Color(0x8b5cf6)}
        speed={speed}
        distort={0.4 * metrics.logicalCohesion}
        radius={1}
      />
    </mesh>
  );
};

const HexaSpace3D = ({ metrics }: HexaSpace3DProps) => {
  return (
    <div className="w-full h-[500px] bg-slate-950 rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-white font-black text-xl tracking-tighter">MAPA VOLUMÉTRICO π√f(A)</h3>
        <p className="text-violet-400 text-xs font-mono uppercase">Renderização em Tempo Real</p>
      </div>
      
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#6366f1" />
        
        <SignificanceCore metrics={metrics} />
        
        {/* Eixos de Significância */}
        <DataPoint position={[2, 0, 0]} color="#ef4444" label="Pragmática" />
        <DataPoint position={[-2, 0, 0]} color="#3b82f6" label="Lógica" />
        <DataPoint position={[0, 2, 0]} color="#10b981" label="Semântica" />
        <DataPoint position={[0, -2, 0]} color="#f59e0b" label="Contexto" />
        
        <gridHelper args={[10, 10, 0x444444, 0x222222]} rotation={[Math.PI / 2, 0, 0]} />
      </Canvas>

      <div className="absolute bottom-6 right-6 z-10 text-right">
        <p className="text-white/40 text-[10px] font-mono">ENGINE: REACT-THREE-FIBER</p>
        <p className="text-white/40 text-[10px] font-mono">COORDINATES: HEXA-RELATIONAL-V1</p>
      </div>
    </div>
  );
};

export default HexaSpace3D;