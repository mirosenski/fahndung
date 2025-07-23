"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageLayout from "~/components/layout/PageLayout";
import Step6Summary from "~/components/fahndungs-wizard/Step6-Summary-Optimized";
import { toast } from "sonner";
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
} from "@/types/fahndung-wizard";

type AllData = {
  step1: Step1Data | null;
  step2: Step2Data | null;
  step3: Step3Data | null;
  step4: Step4Data | null;
  step5: Step5Data | null;
};

type StepData = Step1Data | Step2Data | Step3Data | Step4Data | Step5Data;

interface InvestigationData {
  id: string;
  case_number: string;
  title: string;
  description: string;
  status: string;
  created_by: string;
  created_at: string;
}

function Step6PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allData, setAllData] = useState<AllData>({
    step1: null,
    step2: null,
    step3: null,
    step4: null,
    step5: null,
  });

  useEffect(() => {
    const step1Param = searchParams.get("step1");
    const step2Param = searchParams.get("step2");
    const step3Param = searchParams.get("step3");
    const step4Param = searchParams.get("step4");
    const step5Param = searchParams.get("step5");

    if (step1Param && step2Param && step3Param && step4Param && step5Param) {
      try {
        setAllData({
          step1: JSON.parse(decodeURIComponent(step1Param)) as Step1Data,
          step2: JSON.parse(decodeURIComponent(step2Param)) as Step2Data,
          step3: JSON.parse(decodeURIComponent(step3Param)) as Step3Data,
          step4: JSON.parse(decodeURIComponent(step4Param)) as Step4Data,
          step5: JSON.parse(decodeURIComponent(step5Param)) as Step5Data,
        });
      } catch (error) {
        console.error("Fehler beim Parsen der Daten:", error);
        router.push("/fahndungen/neu");
      }
    } else {
      router.push("/fahndungen/neu");
    }
  }, [searchParams, router]);

  const handleUpdate = (step: string, data: StepData) => {
    setAllData((prev) => ({
      ...prev,
      [step]: data,
    }));
  };

  const handleSubmit = async () => {
    if (
      !allData.step1 ||
      !allData.step2 ||
      !allData.step3 ||
      !allData.step4 ||
      !allData.step5
    ) {
      toast.error("Alle Schritte müssen ausgefüllt sein");
      return;
    }

    setIsSubmitting(true);

    try {
      // User holen
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;
      if (!user) {
        toast.error("Sie müssen angemeldet sein");
        return;
      }

      // 1. Fahndung in Datenbank speichern
      const investigationResponse = await supabase
        .from("investigations")
        .insert({
          // Step 1
          title: allData.step1.title,
          case_number: allData.step1.caseNumber,
          category: allData.step1.category,

          // Step 2
          short_description: allData.step2.shortDescription,
          description: allData.step2.description,
          priority: allData.step2.priority,
          tags: allData.step2.tags,

          // Step 4 (Hauptort)
          location: allData.step4.mainLocation?.address ?? "",
          metadata: {
            locations: {
              main: allData.step4.mainLocation,
              additional: allData.step4.additionalLocations,
              searchRadius: allData.step4.searchRadius,
            },
            features: allData.step2.features ?? "",
          },

          // Step 5
          contact_info: {
            person: allData.step5.contactPerson,
            phone: allData.step5.contactPhone,
            email: allData.step5.contactEmail,
            department: allData.step5.department,
            availableHours: allData.step5.availableHours,
            alternative: allData.step5.alternativeContact,
          },
          station: allData.step5.department,

          // Status & Veröffentlichung
          status:
            allData.step5.publishStatus === "immediate"
              ? "active"
              : allData.step5.publishStatus,
          created_by: user.id,
          date: new Date().toISOString(),
        })
        .select()
        .single();

      if (investigationResponse.error) {
        throw investigationResponse.error;
      }

      const investigationData = investigationResponse.data as InvestigationData;

      // 2. Bilder hochladen
      if (allData.step3.mainImage) {
        const mainImagePath = `${investigationData.case_number}/images/main_${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from("investigation-images")
          .upload(mainImagePath, allData.step3.mainImage);

        if (!uploadError) {
          await supabase.from("investigation_images").insert({
            investigation_id: investigationData.id,
            file_name: mainImagePath,
            original_name: allData.step3.mainImage.name,
            file_path: mainImagePath,
            file_size: allData.step3.mainImage.size,
            mime_type: allData.step3.mainImage.type,
            is_primary: true,
            uploaded_by: user.id,
          });
        }
      }

      // Weitere Bilder
      for (const image of allData.step3.additionalImages) {
        const imagePath = `${investigationData.case_number}/images/${Date.now()}_${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from("investigation-images")
          .upload(imagePath, image);

        if (!uploadError) {
          await supabase.from("investigation_images").insert({
            investigation_id: investigationData.id,
            file_name: imagePath,
            original_name: image.name,
            file_path: imagePath,
            file_size: image.size,
            mime_type: image.type,
            is_primary: false,
            uploaded_by: user.id,
          });
        }
      }

      // 3. Dokumente hochladen
      for (const document of allData.step3.documents) {
        const documentPath = `${investigationData.case_number}/documents/${document.name}`;
        const { error: uploadError } = await supabase.storage
          .from("investigation-documents")
          .upload(documentPath, document);

        if (!uploadError) {
          await supabase.from("investigation_documents").insert({
            investigation_id: investigationData.id,
            file_name: documentPath,
            original_name: document.name,
            file_path: documentPath,
            file_size: document.size,
            mime_type: document.type,
            uploaded_by: user.id,
          });
        }
      }

      // 4. Geplante Veröffentlichung speichern
      if (
        allData.step5.publishStatus === "scheduled" &&
        allData.step5.publishDate
      ) {
        await supabase.from("scheduled_publications").insert({
          investigation_id: investigationData.id,
          scheduled_date: allData.step5.publishDate,
          created_by: user.id,
          status: "pending",
        });
      }

      // 5. Erfolg und Weiterleitung
      toast.success("Fahndung erfolgreich erstellt!");

      if (allData.step5.publishStatus === "immediate") {
        // Direkt zur Detailseite
        router.push(`/fahndungen/${investigationData.id}`);
      } else {
        // Zurück zur Übersicht
        router.push("/fahndungen");
      }
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      toast.error("Fehler beim Speichern der Fahndung");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/fahndungen/neu/step5");
  };

  if (
    !allData.step1 ||
    !allData.step2 ||
    !allData.step3 ||
    !allData.step4 ||
    !allData.step5
  ) {
    return (
      <PageLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/fahndungen/neu/step5"
            className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zu Schritt 5
          </Link>
          <h1 className="text-3xl font-bold">
            Schritt 6: Zusammenfassung & Abschluss
          </h1>
          <p className="mt-2 text-gray-600">
            Überprüfen Sie alle Daten und schließen Sie die Fahndung ab
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Fortschritt
            </span>
            <span className="text-sm font-medium text-gray-700">100%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-green-600"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>

        {/* Step 6 Content */}
        <Step6Summary
          data={{
            step1: allData.step1,
            step2: allData.step2,
            step3: allData.step3,
            step4: allData.step4,
            step5: allData.step5,
          }}
          onUpdate={handleUpdate}
          onSubmit={handleSubmit}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      </div>
    </PageLayout>
  );
}

export default function Step6Page() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        </PageLayout>
      }
    >
      <Step6PageContent />
    </Suspense>
  );
}
