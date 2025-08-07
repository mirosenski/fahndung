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
      {/* Kugel Balu mit angepasstem Gradient - oben verschwindet */}
      <div
        className="absolute h-[1470px] w-[1470px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "linear-gradient(to bottom, rgba(59, 130, 246, 0.055) 0%, rgba(59, 130, 246, 0.037) 20%, rgba(59, 130, 246, 0.018) 40%, transparent 60%, rgba(59, 130, 246, 0.018) 70%, rgba(59, 130, 246, 0.037) 80%, rgba(59, 130, 246, 0.055) 90%, rgba(59, 130, 246, 0.074) 100%)",
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
