import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize subtle particles
    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.1, // Much slower movement
      vy: (Math.random() - 0.5) * 0.1,
      size: Math.random() * 1 + 0.3, // Smaller particles
      opacity: Math.random() * 0.3 + 0.1, // More subtle
      life: 0,
      maxLife: Math.random() * 400 + 200, // Longer lifespan
    });

    // Create very few particles for extreme subtlety
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push(createParticle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(248, 247, 245, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        // Calculate subtle opacity based on life cycle
        const lifeRatio = particle.life / particle.maxLife;
        particle.opacity = Math.sin(lifeRatio * Math.PI) * 0.2; // Much more subtle

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Create golden glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, '#c0a572');
        gradient.addColorStop(0.5, 'rgba(192, 165, 114, 0.3)');
        gradient.addColorStop(1, 'rgba(192, 165, 114, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw core particle
        ctx.fillStyle = '#c0a572';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        // Reset particle if it's dead or out of bounds
        if (particle.life >= particle.maxLife || 
            particle.x < 0 || particle.x > canvas.width ||
            particle.y < 0 || particle.y > canvas.height) {
          particlesRef.current[index] = createParticle();
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};