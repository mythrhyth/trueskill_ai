import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  originalVx: number;
  originalVy: number;
  phase: number;
  phaseSpeed: number;
  isText: boolean;
  text?: string;
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Colors mapping to CSS variables: indigo, purple, cyan with neon glow opacities
    const colors = [
      "rgba(99, 102, 241, 0.75)",  // Indigo
      "rgba(168, 85, 247, 0.75)",  // Purple
      "rgba(6, 182, 212, 0.75)",   // Cyan
    ];

    const skillList = [
      "Python", "PyTorch", "FastAPI", "React", "TypeScript", "SQL",
      "Kubernetes", "Docker", "Next.js", "AI / LLM", "Go", "Rust"
    ];

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initParticles(rect.width, rect.height);
    };

    const initParticles = (width: number, height: number) => {
      particles = [];
      const density = Math.min(Math.floor((width * height) / 9000), 90);
      
      for (let i = 0; i < density; i++) {
        // Organic slow drifts
        const vx = (Math.random() - 0.5) * 0.4;
        const vy = (Math.random() - 0.5) * 0.4;
        
        // Randomly assign a floating technology skill label to some nodes
        const isText = i < skillList.length && Math.random() < 0.7;
        const text = isText ? skillList[i] : undefined;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          originalVx: vx,
          originalVy: vy,
          radius: isText ? 0 : Math.random() * 3 + 2.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: Math.random() * 0.015 + 0.005,
          isText,
          text
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const time = Date.now() / 1000;

      // 1. Draw glowing cosmic vortex halo centerpiece under cursor
      if (mouse.x > 0 && mouse.y > 0) {
        ctx.beginPath();
        const pulseGlow = 220 + Math.sin(time * 3) * 15;
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, pulseGlow);
        gradient.addColorStop(0, "rgba(6, 182, 212, 0.18)");
        gradient.addColorStop(0.3, "rgba(168, 85, 247, 0.08)");
        gradient.addColorStop(0.6, "rgba(99, 102, 241, 0.03)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.arc(mouse.x, mouse.y, pulseGlow, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Update and Draw Particles
      particles.forEach((p) => {
        // Base flow movement using sin waves for organic fluid motion
        p.phase += p.phaseSpeed;
        const driftX = Math.sin(p.phase) * 0.12;
        const driftY = Math.cos(p.phase) * 0.12;

        let targetVx = p.originalVx + driftX;
        let targetVy = p.originalVy + driftY;

        if (mouse.x > 0 && mouse.y > 0) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 280) {
            const force = (280 - dist) / 280;
            const angle = Math.atan2(dy, dx);
            
            // Gravity attraction force inwards
            targetVx += Math.cos(angle) * force * 0.6;
            targetVy += Math.sin(angle) * force * 0.6;

            // Perpendicular swirl vortex force (orbital spinning)
            targetVx += -Math.sin(angle) * force * 0.9;
            targetVy += Math.cos(angle) * force * 0.9;
          }
        }

        // Apply velocities smoothly
        p.vx += (targetVx - p.vx) * 0.04;
        p.vy += (targetVy - p.vy) * 0.04;

        // Cap speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpeed = p.isText ? 1.5 : 2.4;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        // Update positions
        p.x += p.vx;
        p.y += p.vy;

        // Wrapping boundaries for continuous flow
        if (p.x < -60) p.x = width + 60;
        else if (p.x > width + 60) p.x = -60;

        if (p.y < -60) p.y = height + 60;
        else if (p.y > height + 60) p.y = -60;

        // Render nodes
        if (p.isText && p.text) {
          // Draw Neon Floating Skill Tag
          ctx.font = "bold 11px Outfit, Inter, system-ui";
          ctx.fillStyle = p.color.replace("0.75", "0.95");
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fillText(p.text, p.x, p.y + 4);
          ctx.shadowBlur = 0; // reset
          
          // Draw indicator node beside text
          ctx.beginPath();
          ctx.arc(p.x - 6, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else {
          // Draw regular particle with breathing radius
          const breathingRadius = p.radius + Math.sin(p.phase) * 0.7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1.5, breathingRadius), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 3. Draw Connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Draw connection to mouse with a flexy Bezier curve ribbon
        if (mouse.x > 0 && mouse.y > 0) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 240) {
            const alpha = (1 - dist / 240) * 0.45;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            
            // Calculate a wave control point to make connection lines curve like organic strings
            const midX = (p1.x + mouse.x) / 2;
            const midY = (p1.y + mouse.y) / 2;
            const waveOffset = Math.sin(time * 2.2 + p1.phase) * 30;
            
            // Curve perpendicular to line direction
            const lineAngle = Math.atan2(dy, dx);
            const ctrlX = midX + Math.cos(lineAngle + Math.PI / 2) * waveOffset;
            const ctrlY = midY + Math.sin(lineAngle + Math.PI / 2) * waveOffset;
            
            ctx.quadraticCurveTo(ctrlX, ctrlY, mouse.x, mouse.y);
            
            // Wavy cyan cursor links
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 1.4 * (1 - dist / 240);
            ctx.stroke();
          }
        }

        // Draw connections between particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Subtle indigo links
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.8 * (1 - dist / 130);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
