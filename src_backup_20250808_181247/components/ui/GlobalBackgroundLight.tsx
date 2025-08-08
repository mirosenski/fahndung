import React from "react";

interface GlobalBackgroundLightProps {
  className?: string;
  showSphere?: boolean;
}

export const GlobalBackgroundLight: React.FC<GlobalBackgroundLightProps> = ({
  className = "",
  showSphere = true,
}) => {
  return (
    <>
      {/* Light Mode Sphäre */}
      {showSphere && (
        <div
          className="sphere-light absolute h-[1470px] w-[1470px] rounded-full"
          style={{
            background:
              "linear-gradient(to top, rgba(213, 223, 227, 0.54) 0%, rgba(213, 223, 227, 0.36) 10%, rgba(213, 223, 227, 0.18) 30%, transparent 60%)",
            animation: "float 8s ease-in-out infinite",
            left: "50%",
            top: "5%",
            transform: "translate(-50%, -50%)",
            position: "absolute",
            zIndex: 10,
          }}
        />
      )}

      <div
        className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
        style={{
          background:
            "radial-gradient(circle at center, rgba(213, 223, 227, 0.19) 0%, transparent 70%)",
        }}
      >
        {showSphere && (
          <>
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

              /* Light Mode Sphere */
              .sphere-light {
                transform: translate(
                  -50%,
                  calc(-50% + var(--scroll-offset, 0px))
                );
              }

              /* Responsive Sphäre - kleiner auf kleinen Bildschirmen */
              @media (max-width: 768px) {
                .sphere-light {
                  width: 800px !important;
                  height: 800px !important;
                  top: -20% !important;
                }
              }

              @media (max-width: 640px) {
                .sphere-light {
                  width: 600px !important;
                  height: 600px !important;
                  top: -30% !important;
                }
              }

              @media (max-width: 480px) {
                .sphere-light {
                  width: 400px !important;
                  height: 400px !important;
                  top: -40% !important;
                }
              }
            `}</style>

            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.addEventListener('scroll', function() {
                    const scrollY = window.scrollY;
                    const sphereLight = document.querySelector('.sphere-light');
                    if (sphereLight) {
                      sphereLight.style.setProperty('--scroll-offset', scrollY * 0.3 + 'px');
                    }
                  });
                `,
              }}
            />
          </>
        )}
      </div>
    </>
  );
};
