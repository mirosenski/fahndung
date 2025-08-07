"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function TestFahndungPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const createInvestigation = api.post.createInvestigation.useMutation({
    onSuccess: (data) => {
      console.log("✅ Test-Fahndung erstellt:", data);
      setIsCreating(false);
      // Navigiere zur Detailseite
      router.push(`/fahndungen/${data.case_number}`);
    },
    onError: (error) => {
      console.error("❌ Fehler beim Erstellen der Test-Fahndung:", error);
      setIsCreating(false);
    },
  });

  const handleCreateTestFahndung = async () => {
    setIsCreating(true);

    try {
      await createInvestigation.mutateAsync({
        title: "Test Fahndung - Vermisste Person",
        description:
          "Dies ist eine Test-Fahndung für eine vermisste Person. Die Person wurde zuletzt in der Innenstadt gesehen.",
        short_description: "Vermisste Person in der Innenstadt",
        status: "active",
        priority: "urgent",
        category: "MISSING_PERSON",
        location: "Stuttgart Innenstadt",
        contact_info: {
          person: "Polizei Stuttgart",
          phone: "+49 711 8990-0",
          email: "fahndung@polizei-stuttgart.de",
          hours: "24/7",
        },
        tags: ["MISSING_PERSON", "urgent", "Stuttgart"],
        features: "Grüne Jacke, blaue Jeans",
        // Verwende Base64-kodierte SVG-Bilder als Data-URLs
        mainImageUrl:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGY0NmU1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRlc3QgRmFobmR1bmc8L3RleHQ+PC9zdmc+",
        additionalImageUrls: [
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTBiOTgxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlp1c2F0emJpbGQgMTwvdGV4dD48L3N2Zz4=",
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjU5ZTBhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlp1c2F0emJpbGQgMjwvdGV4dD48L3N2Zz4=",
        ],
      });
    } catch (error) {
      console.error("Fehler:", error);
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Test Fahndung erstellen</h1>

      <div className="mb-6">
        <Button
          onClick={handleCreateTestFahndung}
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isCreating ? "Erstelle Test-Fahndung..." : "Test-Fahndung erstellen"}
        </Button>
      </div>

      <div className="rounded-lg border bg-gray-50 p-4">
        <h2 className="mb-4 text-xl font-semibold">Was passiert:</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Erstellt eine Test-Fahndung mit vollständigen Daten</li>
          <li>Navigiert automatisch zur Detailseite</li>
          <li>Zeigt alle Informationen der Fahndung an</li>
        </ul>
      </div>
    </div>
  );
}
