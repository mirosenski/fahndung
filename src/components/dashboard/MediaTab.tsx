import { Upload } from "lucide-react";

export default function MediaTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Medienverwaltung
          </h2>
          <button className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Medienverwaltung wird implementiert...
        </p>
      </div>
    </div>
  );
}
