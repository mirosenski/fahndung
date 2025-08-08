import React from "react";

interface GlobalBackgroundDarkProps {
  className?: string;
  showSphere?: boolean;
}

export const GlobalBackgroundDark: React.FC<GlobalBackgroundDarkProps> = ({
  className = "",
  showSphere = true,
}) => {
  return (
    <>
      {/* Dark Mode Sphäre */}
      {showSphere && (
        <div
          className="sphere-dark absolute h-[1470px] w-[1470px] rounded-full"
          style={{
            background:
              "linear-gradient(to top, rgba(30, 58, 138, 0.38) 0%, rgba(30, 58, 138, 0.19) 10%, rgba(30, 58, 138, 0.077) 30%, transparent 60%)",
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
            "radial-gradient(circle at center, rgba(213, 223, 227, 0.095) 0%, transparent 70%)",
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

              /* Dark Mode Sphere */
              .sphere-dark {
                transform: translate(
                  -50%,
                  calc(-50% + var(--scroll-offset, 0px))
                );
              }

              /* Responsive Sphäre - kleiner auf kleinen Bildschirmen */
              @media (max-width: 768px) {
                .sphere-dark {
                  width: 800px !important;
                  height: 800px !important;
                  top: -20% !important;
                }
              }

              @media (max-width: 640px) {
                .sphere-dark {
                  width: 600px !important;
                  height: 600px !important;
                  top: -30% !important;
                }
              }

              @media (max-width: 480px) {
                .sphere-dark {
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
                    const sphereDark = document.querySelector('.sphere-dark');
                    if (sphereDark) {
                      sphereDark.style.setProperty('--scroll-offset', scrollY * 0.3 + 'px');
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
