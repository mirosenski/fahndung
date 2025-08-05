import AdaptiveHeaderOptimized from "~/components/layout/AdaptiveHeaderOptimized";
import { HeaderPerformanceTest } from "~/components/layout/HeaderPerformanceTest";

export default function TestHeaderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Test der neuen Header-Komponente */}
      <AdaptiveHeaderOptimized variant="home" />

      {/* Test-Content mit viel Scroll-Space */}
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <section className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              Test der neuen adaptiven Header-Komponente
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Scrollen Sie nach unten, um zu sehen, wie sich der Header anpasst.
              Die Meta-Bar verschwindet beim Scrollen und der Header wird
              sticky.
            </p>
          </section>

          {/* Viel Content für Scroll-Test */}
          {Array.from({ length: 20 }, (_, i) => (
            <section
              key={i}
              className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
            >
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                Sektion {i + 1}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Feature 1
                  </h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                    Barrierefreiheit und adaptive Design-Funktionen.
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <h3 className="font-medium text-green-900 dark:text-green-100">
                    Feature 2
                  </h3>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-200">
                    Responsive Navigation mit Mega-Menüs.
                  </p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                  <h3 className="font-medium text-purple-900 dark:text-purple-100">
                    Feature 3
                  </h3>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-200">
                    Performance-optimierte Scroll-Animationen.
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Performance Test */}
      <HeaderPerformanceTest />
    </div>
  );
}
