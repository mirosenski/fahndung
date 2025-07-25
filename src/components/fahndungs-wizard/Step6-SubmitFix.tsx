import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
} from "@/types/fahndung-wizard";

interface AllData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
}

export async function handleFahndungSubmit(
  allData: AllData,
  onSuccess?: (id: string) => void,
  onError?: (error: string) => void,
) {
  const supabase = createClientComponentClient();

  try {
    // 1. User validieren
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Sie müssen angemeldet sein");
    }

    // 2. Fahndung in Datenbank speichern
    const investigationData = {
      // Step 1
      title: allData.step1.title,
      case_number: allData.step1.caseNumber,
      category: allData.step1.category,

      // Step 2
      short_description: allData.step2.shortDescription,
      description: allData.step2.description,
      priority: allData.step2.priority,
      tags: allData.step2.tags,
      features: allData.step2.features || "",

      // Step 4 (Hauptort)
      location: allData.step4.mainLocation?.address || "",
      metadata: {
        locations: {
          main: allData.step4.mainLocation,
          additional: allData.step4.additionalLocations,
          searchRadius: allData.step4.searchRadius,
        },
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
    };

    const { data: investigation, error: investigationError } = await supabase
      .from("investigations")
      .insert(investigationData)
      .select()
      .single();

    if (investigationError) {
      throw investigationError;
    }

    // 3. Bilder hochladen (wenn vorhanden)
    if (allData.step3.mainImage) {
      const timestamp = Date.now();
      const mainImagePath = `${investigation.case_number}/images/main_${timestamp}_${allData.step3.mainImage.name}`;

      const { error: uploadError } = await supabase.storage
        .from("investigation-images")
        .upload(mainImagePath, allData.step3.mainImage);

      if (uploadError) {
        console.error("Fehler beim Hauptbild-Upload:", uploadError);
      } else {
        // Metadaten speichern
        await supabase.from("investigation_images").insert({
          investigation_id: investigation.id,
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

    // Weitere Bilder hochladen
    for (const [index, image] of allData.step3.additionalImages.entries()) {
      const timestamp = Date.now();
      const imagePath = `${investigation.case_number}/images/${timestamp}_${index}_${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("investigation-images")
        .upload(imagePath, image);

      if (!uploadError) {
        await supabase.from("investigation_images").insert({
          investigation_id: investigation.id,
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

    // 4. Dokumente hochladen
    for (const document of allData.step3.documents) {
      const documentPath = `${investigation.case_number}/documents/${document.name}`;

      const { error: uploadError } = await supabase.storage
        .from("investigation-documents")
        .upload(documentPath, document);

      if (!uploadError) {
        await supabase.from("investigation_documents").insert({
          investigation_id: investigation.id,
          file_name: documentPath,
          original_name: document.name,
          file_path: documentPath,
          file_size: document.size,
          mime_type: document.type,
          uploaded_by: user.id,
        });
      }
    }

    // 5. Artikel-Publishing (wenn aktiviert)
    if (allData.step5.articlePublishing?.publishAsArticle) {
      const articleContent = {
        blocks: [
          {
            type: "heading" as const,
            level: 1,
            content: allData.step1.title,
          },
          {
            type: "paragraph" as const,
            content: allData.step2.shortDescription,
          },
          {
            type: "heading" as const,
            level: 2,
            content: "Beschreibung",
          },
          {
            type: "paragraph" as const,
            content: allData.step2.description,
          },
        ],
      };

      const articleMeta = {
        seo_title:
          allData.step5.articlePublishing.seoTitle || allData.step1.title,
        seo_description:
          allData.step5.articlePublishing.seoDescription ||
          allData.step2.shortDescription,
        keywords: allData.step5.articlePublishing.keywords || [],
        author: allData.step5.articlePublishing.author || user.email,
        reading_time:
          allData.step5.articlePublishing.readingTime ||
          Math.ceil(
            (allData.step2.description.length +
              allData.step2.shortDescription.length) /
              200,
          ),
      };

      await supabase
        .from("investigations")
        .update({
          published_as_article: true,
          article_content: articleContent,
          article_meta: articleMeta,
          article_published_at: new Date().toISOString(),
        })
        .eq("id", investigation.id);
    }

    // 6. Erfolg!
    toast.success("Fahndung erfolgreich erstellt!");

    if (onSuccess) {
      onSuccess(investigation.id);
    }

    return { success: true, id: investigation.id };
  } catch (error: any) {
    console.error("Fehler beim Speichern:", error);
    const errorMessage = error.message || "Unbekannter Fehler beim Speichern";

    toast.error(`Fehler: ${errorMessage}`);

    if (onError) {
      onError(errorMessage);
    }

    return { success: false, error: errorMessage };
  }
}
