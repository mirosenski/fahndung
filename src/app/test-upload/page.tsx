import { UploadTest } from "~/components/UploadTest";
import { LoginForm } from "~/components/LoginForm";

export default function TestUploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">🧪 Upload Test Seite</h1>

        <div className="mb-6 rounded border border-yellow-200 bg-yellow-50 p-4">
          <h2 className="mb-2 text-lg font-semibold text-yellow-800">
            ⚠️ Wichtige Hinweise:
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700">
            <li>Diese Seite ist nur für Tests gedacht</li>
            <li>Überprüfe die Browser-Console für detaillierte Logs</li>
            <li>Stelle sicher, dass du bei Supabase eingeloggt bist</li>
            <li>Der 'media' Bucket muss in Supabase existieren</li>
          </ul>
        </div>

        {/* Login Section */}
        <div className="mb-6">
          <LoginForm />
        </div>

        {/* Upload Test Section */}
        <div className="mt-8">
          <UploadTest />
        </div>
      </div>
    </div>
  );
}
