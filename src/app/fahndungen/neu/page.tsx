"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import FahndungsWizard from "@/app/components/fahndungs-wizard/FahndungsWizard";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NeueFahndungPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold">Neue Fahndung erstellen</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8">
        <Suspense
          fallback={
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          }
        >
          <FahndungsWizard onComplete={() => router.push("/fahndungen")} />
        </Suspense>
      </main>
    </div>
  );
}
