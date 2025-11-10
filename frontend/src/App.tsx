import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function App() {
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div
        ref={textRef}
        className="text-4xl font-bold text-gray-800 tracking-tight"
      >
        Hello, GSAP + Tailwind 🚀
      </div>
    </div>
  );
}
