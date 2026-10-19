'use client';

import { useState, useRef, ReactNode } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export default function MagneticButton({
  children,
  className = '',
  onClick,
  ariaLabel,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Gentle magnet pull distance
    const pullX = (e.clientX - centerX) * 0.25;
    const pullY = (e.clientY - centerY) * 0.25;

    setPosition({ x: pullX, y: pullY });
  };

  const handlePointerLeave = () => {
    setPosition({ x: 0, y: 0 });
    setIsPressed(false);
  };

  return (
    <button
      ref={buttonRef}
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${
          isPressed ? 0.95 : 1
        })`,
        transition: isPressed ? 'transform 0.05s ease' : 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
      className={`relative inline-flex items-center justify-center font-bold overflow-hidden select-none active:scale-95 touch-none ${className}`}
    >
      {/* Light Sweep Effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[sweep_1.5s_infinite]" />
      {children}
    </button>
  );
}
