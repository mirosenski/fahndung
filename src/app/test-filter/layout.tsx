import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Filter-Komponente Test | Polizei Baden-Württemberg",
  description:
    "Testen Sie die neue CompactFilter-Komponente mit verschiedenen Filteroptionen und sehen Sie die Ergebnisse in Echtzeit.",
};

export default function TestFilterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
