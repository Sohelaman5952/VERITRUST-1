/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

interface AntigravityProps {
  count?: number;
  magnetRadius?: number;
  ringRadius?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  particleSize?: number;
  lerpSpeed?: number;
  color?: string;
  autoAnimate?: boolean;
  particleVariance?: number;
  rotationSpeed?: number;
  depthFactor?: number;
  pulseSpeed?: number;
  particleShape?: 'capsule' | 'circle';
  fieldStrength?: number;
}

const AntigravityInner: React.FC<AntigravityProps> = ({
  count = 300,
  magnetRadius = 10,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.1,
  color = '#FF9FFC',
  autoAnimate = false,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = 'capsule',
  fieldStrength = 10
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport, mouse } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseMoveTime = useRef(0);
  const virtualMouse = useRef({ x: 0, y: 0 });

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = ringRadius + (Math.random() - 0.5) * particleVariance;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * depthFactor * 5;
      
      temp.push({
        initialPosition: new THREE.Vector3(x, y, z),
        phase: Math.random() * Math.PI * 2
      });
    }
    return temp;
  }, [count, ringRadius, particleVariance, depthFactor]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Mouse tracking logic
    if (mouse.x !== lastMousePos.current.x || mouse.y !== lastMousePos.current.y) {
      lastMousePos.current = { x: mouse.x, y: mouse.y };
      lastMouseMoveTime.current = time;
      virtualMouse.current = { x: mouse.x, y: mouse.y };
    } else if (autoAnimate) {
      // If mouse hasn't moved, auto-animate the virtual mouse
      const idleTime = time - lastMouseMoveTime.current;
      if (idleTime > 1) {
        virtualMouse.current.x = Math.sin(time * 0.5) * 0.5;
        virtualMouse.current.y = Math.cos(time * 0.3) * 0.5;
      }
    }

    const mouseX = (virtualMouse.current.x * viewport.width) / 2;
    const mouseY = (virtualMouse.current.y * viewport.height) / 2;
    const mouseVec = new THREE.Vector3(mouseX, mouseY, 0);

    particles.forEach((particle, i) => {
      const { initialPosition, phase } = particle;
      
      // Wave motion
      const waveX = Math.sin(time * waveSpeed + phase) * waveAmplitude * 0.5;
      const waveY = Math.cos(time * waveSpeed + phase) * waveAmplitude * 0.5;
      
      const targetPos = initialPosition.clone().add(new THREE.Vector3(waveX, waveY, 0));

      // Magnet effect
      const dist = targetPos.distanceTo(mouseVec);
      if (dist < magnetRadius) {
        const force = (1 - dist / magnetRadius) * fieldStrength * 0.2;
        const dir = targetPos.clone().sub(mouseVec).normalize();
        targetPos.add(dir.multiplyScalar(force));
      }

      // Update dummy for instanced mesh
      meshRef.current!.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
      
      dummy.position.lerp(targetPos, lerpSpeed);
      
      if (rotationSpeed > 0) {
        dummy.rotation.z += rotationSpeed * 0.01;
      }
      
      const pulse = 1 + Math.sin(time * pulseSpeed + phase) * 0.1;
      dummy.scale.set(pulse, pulse, pulse);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {particleShape === 'capsule' ? (
        <capsuleGeometry args={[particleSize * 0.05, particleSize * 0.2, 4, 8]} />
      ) : (
        <sphereGeometry args={[particleSize * 0.05, 8, 8]} />
      )}
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </instancedMesh>
  );
};

const Antigravity: React.FC<AntigravityProps> = (props) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 75 }} gl={{ alpha: true }}>
        <AntigravityInner {...props} />
      </Canvas>
    </div>
  );
};

export default Antigravity;
