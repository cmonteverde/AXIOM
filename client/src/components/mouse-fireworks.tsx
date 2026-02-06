import { useEffect, useState, useCallback } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export function MouseFireworks() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const colors = ["#7C3AED", "#4ADE80", "#FACC15", "#D4C2FO"];

  const createParticles = useCallback((x: number, y: number) => {
    // Check if mouse is over the central card (roughly)
    // The card is max-w-lg (512px) and centered
    const cardWidth = 512;
    const cardHeight = 600; // approximation
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const cardXStart = (windowWidth - cardWidth) / 2;
    const cardXEnd = cardXStart + cardWidth;
    const cardYStart = (windowHeight - cardHeight) / 2;
    const cardYEnd = cardYStart + cardHeight;

    if (x > cardXStart && x < cardXEnd && y > cardYStart && y < cardYEnd) {
      return;
    }

    const newParticles: Particle[] = [];
    for (let i = 0; i < 5; i++) {
      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
      });
    }
    setParticles((prev) => [...prev, ...newParticles].slice(-50));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      createParticles(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [createParticles]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // gravity
            alpha: p.alpha - 0.02,
          }))
          .filter((p) => p.alpha > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.alpha,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
