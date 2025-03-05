import React, { useEffect, useRef } from 'react';

export function WaveformBackground({ isPlaying }) {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(147, 51, 234, 0.5)');
      gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.5)');
      gradient.addColorStop(1, 'rgba(147, 51, 234, 0.5)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const amplitude = isPlaying ? 50 : 20;
      const frequency = isPlaying ? 0.02 : 0.01;
      const speed = isPlaying ? 0.02 : 0.005;

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + 
          Math.sin(x * frequency + phaseRef.current) * amplitude * Math.sin(x * 0.001) +
          Math.sin(x * 0.01 + phaseRef.current * 0.5) * (amplitude * 0.6);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      phaseRef.current += speed;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-30 transition-opacity duration-300 dark:opacity-20"
    />
  );
}
