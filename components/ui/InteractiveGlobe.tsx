'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Global coordinates for nodes (latitude, longitude in degrees)
const HUB_LOCATIONS = [
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
];

function latLongToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Function to generate curved arc points between two coordinates
function createCurveArc(start: THREE.Vector3, end: THREE.Vector3, globeRadius: number) {
  const distance = start.distanceTo(end);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  // Elevate mid point above globe surface based on distance
  mid.normalize().multiplyScalar(globeRadius + distance * 0.35);

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve.getPoints(36);
}

export default function InteractiveGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 6.2;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 2.2;

    // 2. Globe Mesh (Inner glowing sphere)
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 48, 48);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.85,
    });
    const globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeMesh);

    // 3. Dots Grid for Holographic Earth Effect
    const dotCount = 1800;
    const dotGeo = new THREE.BufferGeometry();
    const dotPositions = new Float32Array(dotCount * 3);

    for (let i = 0; i < dotCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / dotCount);
      const theta = Math.sqrt(dotCount * Math.PI) * phi;

      const x = GLOBE_RADIUS * 1.01 * Math.cos(theta) * Math.sin(phi);
      const y = GLOBE_RADIUS * 1.01 * Math.sin(theta) * Math.sin(phi);
      const z = GLOBE_RADIUS * 1.01 * Math.cos(phi);

      dotPositions[i * 3] = x;
      dotPositions[i * 3 + 1] = y;
      dotPositions[i * 3 + 2] = z;
    }

    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xeab308, // Gold theme color
      size: 0.022,
      transparent: true,
      opacity: 0.75,
    });
    const dotPoints = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(dotPoints);

    // 4. Outer Atmosphere Ring Glow
    const haloGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.15, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xeab308,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(haloMesh);

    // 5. Hub Nodes & Arcs
    const nodeVectors = HUB_LOCATIONS.map((loc) =>
      latLongToVector3(loc.lat, loc.lon, GLOBE_RADIUS * 1.015)
    );

    // Node glowing spheres
    const nodeGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    nodeVectors.forEach((pos) => {
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      globeGroup.add(nodeMesh);
    });

    // Create network arcs between hubs
    const arcLines: THREE.Line[] = [];
    for (let i = 0; i < nodeVectors.length; i++) {
      const nextIdx = (i + 1) % nodeVectors.length;
      const points = createCurveArc(nodeVectors[i], nodeVectors[nextIdx], GLOBE_RADIUS);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.45,
      });
      const line = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(line);
      arcLines.push(line);
    }

    // 6. Floating Cloud Particles
    const particlesCount = 350;
    const particlePositions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const r = GLOBE_RADIUS * (1.2 + Math.random() * 0.8);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffedd5,
      size: 0.018,
      transparent: true,
      opacity: 0.5,
    });
    const cloudParticles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(cloudParticles);

    // Initial orientation tilt
    globeGroup.rotation.x = 0.35;
    globeGroup.rotation.y = -0.5;

    // 7. Touch & Drag Controls for Mobile / Pointer
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousPointerX;
      const deltaY = e.clientY - previousPointerY;

      velocityX = deltaX * 0.005;
      velocityY = deltaY * 0.005;

      globeGroup.rotation.y += velocityX;
      globeGroup.rotation.x += velocityY;

      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 8. GSAP ScrollTrigger Integration for Continuous Motion & Scroll Scrubbing
    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.2,
      onUpdate: (self) => {
        const progress = self.progress;
        globeGroup.rotation.y = progress * Math.PI * 2.5;
        globeGroup.rotation.z = Math.sin(progress * Math.PI) * 0.2;
        cloudParticles.rotation.y = -progress * Math.PI * 1.5;
      },
    });

    // 9. Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        globeGroup.rotation.y += 0.0025;
        globeGroup.rotation.x += (0.35 - globeGroup.rotation.x) * 0.05;
        cloudParticles.rotation.y -= 0.001;

        velocityX *= 0.92;
        velocityY *= 0.92;
        globeGroup.rotation.y += velocityX;
        globeGroup.rotation.x += velocityY;
      }

      haloMesh.rotation.y -= 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Responsive Handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      scrollTrigger.kill();
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300px] sm:h-[400px] md:h-[480px] flex items-center justify-center overflow-hidden touch-none select-none"
    >
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-gold/30 text-[10px] font-mono text-gold-light uppercase tracking-wider shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
        <span>Inclinez & faites pivoter le globe 3D</span>
      </div>
    </div>
  );
}
