import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text3D, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const RotatingBook = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.8, 1, 0.1]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.3} roughness={0.3} />
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </mesh>
    </Float>
  );
};

const FloatingQuizCard = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[1.2, 0.8]} />
      <meshStandardMaterial 
        color="#f59e0b" 
        transparent 
        opacity={0.9}
        metalness={0.2}
        roughness={0.1}
      />
    </mesh>
  );
};

const Brain3D = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={meshRef} position={position}>
        <mesh>
          <sphereGeometry args={[0.6, 32, 16]} />
          <meshStandardMaterial 
            color="#8b5cf6" 
            metalness={0.4} 
            roughness={0.2}
            emissive="#4c1d95"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Neural connections */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} 
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 0.7,
              Math.sin((i / 8) * Math.PI * 2) * 0.7,
              0
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#06d6a0" emissive="#059669" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};

export const EducationScene = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4f46e5" />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#f59e0b" />
        <spotLight position={[0, 10, 0]} intensity={0.8} color="#8b5cf6" />
        
        <RotatingBook position={[-3, 1, 0]} />
        <FloatingQuizCard position={[3, -1, 0]} />
        <Brain3D position={[0, 0, 2]} />
        
        <RotatingBook position={[2, 2, -1]} />
        <FloatingQuizCard position={[-2, -2, 1]} />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};