import React from "react";

interface GlobalBackgroundProps {
  className?: string;
}

export const GlobalBackground: React.FC<GlobalBackgroundProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      style={{
        background:
          "radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
      }}
    >
      {/* Zentrale Kugel im gesamten Hintergrund */}
      <div
        className="absolute h-[1470px] w-[1470px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/30"
        style={{
          animation: "float 8s ease-in-out infinite",
          left: "78%",
          top: "63%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      />

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};
