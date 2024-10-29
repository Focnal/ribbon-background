import React, { useEffect, useRef } from "react";

interface AnimatedBackgroundProps {
  zIndex?: number;
  alpha?: number;
  size?: number;
  excludedSelectors?: string[];
}

const RibbonBackground: React.FC<AnimatedBackgroundProps> = ({
  zIndex = -1,
  alpha = 0.5,
  size = 100,
  excludedSelectors = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const g2d = canvas.getContext("2d");
    const pr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const f = size;
    let q: { x: number; y: number }[], t: number;
    let r = 0;
    const pi = Math.PI * 2;
    const cos = Math.cos;
    const random = Math.random;

    if (!g2d) {
      console.error("2D context not available");
      return;
    }

    canvas.width = width * pr;
    canvas.height = height * pr;
    g2d.scale(pr, pr);
    g2d.globalAlpha = alpha;
    canvas.style.cssText = `opacity: ${alpha}; position: fixed; top: 0; left: 0; z-index: ${zIndex}; width: 100%; height: 100%; pointer-events: none;`;

    function redraw() {
      if (g2d) {
        g2d.clearRect(0, 0, width, height);
        q = [
          { x: 0, y: height * 0.7 + f },
          { x: 0, y: height * 0.7 - f },
        ];
        while (q[1].x < width + f) draw(q[0], q[1]);
      }
    }

    function draw(i: { x: number; y: number }, j: { x: number; y: number }) {
      if (g2d) {
        g2d.beginPath();
        g2d.moveTo(i.x, i.y);
        g2d.lineTo(j.x, j.y);
        const k = j.x + (random() * 2 - 0.25) * f;
        const n = line(j.y);
        g2d.lineTo(k, n);
        g2d.closePath();
        r -= pi / -50;
        g2d.fillStyle = `#${(
          ((cos(r) * 127 + 128) << 16) |
          ((cos(r + pi / 3) * 127 + 128) << 8) |
          (cos(r + (pi / 3) * 2) * 127 + 128)
        ).toString(16)}`;
        g2d.fill();
        q[0] = q[1];
        q[1] = { x: k, y: n };
      }
    }
    function line(p: number): number {
      t = p + (random() * 2 - 1.1) * f;
      return t > height || t < 0 ? line(p) : t;
    }

    function handleRedraw(event: MouseEvent | TouchEvent) {
      const target = event.target as HTMLElement;
      const shouldExclude = excludedSelectors.some((selector) =>
        target.closest(selector)
      );
      if (!shouldExclude) {
        redraw();
      }
    }

    document.addEventListener("click", handleRedraw);
    document.addEventListener("touchstart", handleRedraw);

    redraw(); // Initial draw

    return () => {
      document.removeEventListener("click", handleRedraw);
      document.removeEventListener("touchstart", handleRedraw);
    };
  }, [alpha, size, zIndex, excludedSelectors]);

  return <canvas ref={canvasRef} />;
};

export default RibbonBackground;
