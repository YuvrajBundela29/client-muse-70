import { useState, useEffect } from "react";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export const RainbowMatrixShader = () => {
  const { width, height } = useWindowSize();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="w-full h-full opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, hsl(var(--glow-violet) / 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, hsl(var(--glow-cyan) / 0.1) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  );
};
