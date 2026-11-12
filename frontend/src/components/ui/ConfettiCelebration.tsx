import React, { useEffect, useRef } from 'react';

interface ConfettiPiece {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  opacity: number;
  decay: number;
  shape: 'rect' | 'circle' | 'star';
}

const CYBER_COLORS = [
  '#22c55e', // Neon green
  '#10b981', // Emerald
  '#38bdf8', // Electric Cyan
  '#06b6d4', // Deep cyan
  '#f59e0b', // Amber / Gold
  '#eab308', // Bright yellow
  '#a855f7', // Cyber violet
  '#ec4899', // Cyber pink
  '#ffffff', // Sparkle white
];

interface ConfettiCelebrationProps {
  durationMs?: number;
  particleCount?: number;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  durationMs = 4000,
  particleCount = 140,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: ConfettiPiece[] = [];
    const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'circle', 'star'];

    // Spawn 2 cannon bursts: bottom-left and bottom-right, plus center fountain
    for (let i = 0; i < particleCount; i++) {
      const fromLeft = i % 3 === 0;
      const fromRight = i % 3 === 1;

      let startX = width / 2;
      let startY = height * 0.65;
      let angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      let speed = 12 + Math.random() * 18;

      if (fromLeft) {
        startX = width * 0.15;
        startY = height * 0.85;
        angle = -Math.PI / 3 + (Math.random() - 0.5) * 0.8;
      } else if (fromRight) {
        startX = width * 0.85;
        startY = height * 0.85;
        angle = (-2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.8;
      }

      particles.push({
        x: startX,
        y: startY,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 12,
        color: CYBER_COLORS[Math.floor(Math.random() * CYBER_COLORS.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: 0.006 + Math.random() * 0.008,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    let animationFrameId: number;
    const startTime = performance.now();

    const render = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.opacity <= 0.01) continue;

        aliveCount++;

        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38; // Gravity
        p.vx *= 0.985; // Air drag
        p.rotation += p.vRot;

        // Start fading out after 1.5 seconds
        if (elapsed > 1200) {
          p.opacity = Math.max(0, p.opacity - p.decay);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 4-point sparkle star
          ctx.beginPath();
          ctx.moveTo(0, -p.h / 1.5);
          ctx.lineTo(p.w / 3, -p.h / 6);
          ctx.lineTo(p.w / 1.5, 0);
          ctx.lineTo(p.w / 3, p.h / 6);
          ctx.lineTo(0, p.h / 1.5);
          ctx.lineTo(-p.w / 3, p.h / 6);
          ctx.lineTo(-p.w / 1.5, 0);
          ctx.lineTo(-p.w / 3, -p.h / 6);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (aliveCount > 0 && elapsed < durationMs) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [durationMs, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
};
