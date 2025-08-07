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
      {/* Kugel Balu mit angepasstem Gradient - klarere untere Kante */}
      <div
        className="absolute h-[1470px] w-[1470px] rounded-full"
        style={{
          background:
            "linear-gradient(to top, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 10%, rgba(59, 130, 246, 0.04) 30%, transparent 60%)",
          animation: "float 8s ease-in-out infinite",
          left: "50%",
          top: "10%",
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
