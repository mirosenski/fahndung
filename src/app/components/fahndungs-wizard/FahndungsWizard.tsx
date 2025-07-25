"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronRight,
  ChevronLeft,
  X,
  Save,
  AlertCircle,
  Check,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { getErrorMessage } from "@/types/errors";

// Types
interface Investigation {
  id?: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: "draft" | "active" | "published" | "closed";
  priority: "normal" | "urgent" | "new";
  category:
    | "WANTED_PERSON"
    | "MISSING_PERSON"
    | "UNKNOWN_DEAD"
    | "STOLEN_GOODS";
  location: string;
  station: string;
  contact_info: {
    name?: string;
    phone?: string;
    email?: string;
  };
  features: string;
  date: string;
  tags?: string[];
}

interface UploadedImage {
  file: File;
  preview: string;
  description?: string;
  isPrimary?: boolean;
}

// Validation schemas
const step1Schema = z.object({
  title: z.string().min(5, "Titel muss mindestens 5 Zeichen haben"),
  case_number: z.string().min(3, "Aktenzeichen ist erforderlich"),
  category: z.enum([
    "WANTED_PERSON",
    "MISSING_PERSON",
    "UNKNOWN_DEAD",
    "STOLEN_GOODS",
  ]),
  priority: z.enum(["normal", "urgent", "new"]),
  date: z.string().min(1, "Datum ist erforderlich"),
});

const step2Schema = z.object({
  short_description: z
    .string()
    .min(20, "Kurzbeschreibung muss mindestens 20 Zeichen haben")
    .max(500),
  description: z
    .string()
    .min(50, "Beschreibung muss mindestens 50 Zeichen haben"),
  features: z.string(),
  tags: z.array(z.string()).default([]),
});

const step3Schema = z.object({
  location: z.string().min(3, "Ort ist erforderlich"),
  station: z.string().min(3, "Dienststelle ist erforderlich"),
  contact_info: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
  }),
});

export default function FahndungsWizard({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<Investigation>({
    title: "",
    case_number: "",
    description: "",
    short_description: "",
    status: "draft",
    priority: "normal",
    category: "WANTED_PERSON",
    location: "",
    station: "",
    contact_info: {},
    features: "",
    date: new Date().toISOString().split("T")[0] ?? "",
    tags: [],
  });

  // Setup forms for each step
  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: formData.title,
      case_number: formData.case_number,
      category: formData.category,
      priority: formData.priority,
      date: formData.date,
    },
  });

  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      short_description: formData.short_description,
      description: formData.description,
      features: String(formData.features),
      tags: formData.tags ?? [],
    },
  });

  const step3Form = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      location: formData.location,
      station: formData.station,
      contact_info: formData.contact_info,
    },
  });

  // Handle step navigation
  const handleNext = async () => {
    let isValid = false;
    let data = {};

    switch (currentStep) {
      case 1:
        isValid = await step1Form.trigger();
        data = step1Form.getValues();
        break;
      case 2:
        isValid = await step2Form.trigger();
        data = step2Form.getValues();
        break;
      case 3:
        isValid = await step3Form.trigger();
        data = step3Form.getValues();
        break;
      case 4:
        // Validierung für Bilder-Upload
        isValid = uploadedImages.length > 0;
        if (!isValid) {
          toast.error("Bitte laden Sie mindestens ein Bild hoch.");
        }
        break;
    }

    if (isValid) {
      setFormData({ ...formData, ...data });
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Image upload handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setUploadedImages((prev) => [
            ...prev,
            {
              file,
              preview: result,
              isPrimary: prev.length === 0,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // Wenn das Hauptbild entfernt wird, mache das erste zum Hauptbild
      if (prev[index]?.isPrimary && newImages.length > 0) {
        newImages[0]!.isPrimary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (index: number) => {
    setUploadedImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    );
  };

  // Submit investigation
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create investigation data
      const investigationData = {
        ...formData,
        status: "active" as const,
        images: uploadedImages,
      };

      console.log("Fahndung erstellt:", investigationData);

      toast.success("Fahndung erfolgreich erstellt!");
      onComplete?.();

      // Simulate navigation
      setTimeout(() => {
        router.push("/fahndungen");
      }, 1000);
    } catch (error: unknown) {
      toast.error(
        "Fehler beim Erstellen der Fahndung: " + getErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step components
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Grundinformationen</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Titel *</label>
          <input
            {...step1Form.register("title")}
            className="input-dark-mode"
            placeholder="z.B. Vermisste Person..."
          />
          {step1Form.formState.errors.title && (
            <p className="mt-1 text-sm text-red-500">
              {step1Form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Aktenzeichen *
          </label>
          <input
            {...step1Form.register("case_number")}
            className="input-dark-mode"
            placeholder="z.B. 2024-001"
          />
          {step1Form.formState.errors.case_number && (
            <p className="mt-1 text-sm text-red-500">
              {step1Form.formState.errors.case_number.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Kategorie *</label>
          <select
            {...step1Form.register("category")}
            className="select-dark-mode"
          >
            <option value="WANTED_PERSON">Straftäter</option>
            <option value="MISSING_PERSON">Vermisste Person</option>
            <option value="UNKNOWN_DEAD">Unbekannte Tote</option>
            <option value="STOLEN_GOODS">Sachen</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Priorität *</label>
          <select
            {...step1Form.register("priority")}
            className="select-dark-mode"
          >
            <option value="normal">Normal</option>
            <option value="urgent">Dringend</option>
            <option value="new">Neu</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Datum *</label>
          <input
            type="date"
            {...step1Form.register("date")}
            className="input-dark-mode"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Beschreibung</h2>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Kurzbeschreibung * (max. 500 Zeichen)
        </label>
        <textarea
          {...step2Form.register("short_description")}
          rows={3}
          className="textarea-dark-mode"
          placeholder="Kurze Zusammenfassung für die Übersicht..."
        />
        {step2Form.formState.errors.short_description && (
          <p className="mt-1 text-sm text-red-500">
            {step2Form.formState.errors.short_description.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Ausführliche Beschreibung *
        </label>
        <textarea
          {...step2Form.register("description")}
          rows={6}
          className="textarea-dark-mode"
          placeholder="Detaillierte Beschreibung des Falls..."
        />
        {step2Form.formState.errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {step2Form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Besondere Merkmale
        </label>
        <textarea
          {...step2Form.register("features")}
          rows={3}
          className="textarea-dark-mode"
          placeholder="z.B. Narben, Tattoos, Auffälligkeiten..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Tags (mit Komma trennen)
        </label>
        <input
          {...step2Form.register("tags")}
          className="input-dark-mode"
          placeholder="z.B. Betrug, Gewalt, Vermisst"
          onChange={(e) => {
            const tags = e.target.value
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag);
            step2Form.setValue("tags", tags);
          }}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Kontaktinformationen</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Ort *</label>
          <input
            {...step3Form.register("location")}
            className="input-dark-mode"
            placeholder="z.B. Stuttgart"
          />
          {step3Form.formState.errors.location && (
            <p className="mt-1 text-sm text-red-500">
              {step3Form.formState.errors.location.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Dienststelle *
          </label>
          <input
            {...step3Form.register("station")}
            className="input-dark-mode"
            placeholder="z.B. Polizeipräsidium Stuttgart"
          />
          {step3Form.formState.errors.station && (
            <p className="mt-1 text-sm text-red-500">
              {step3Form.formState.errors.station.message}
            </p>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="mb-4 text-lg font-semibold">Ansprechpartner</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Name</label>
            <input
              {...step3Form.register("contact_info.name")}
              className="input-dark-mode"
              placeholder="Ansprechpartner"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Telefon</label>
            <input
              {...step3Form.register("contact_info.phone")}
              className="input-dark-mode"
              placeholder="+49 711 12345"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">E-Mail</label>
            <input
              {...step3Form.register("contact_info.email")}
              type="email"
              className="input-dark-mode"
              placeholder="kontakt@polizei.de"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Bilder hochladen</h2>

      <div
        className={`rounded-lg border-2 border-dashed p-8 text-center ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-2 text-gray-600">Bilder hier ablegen oder</p>
        <label className="cursor-pointer">
          <span className="inline-block rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Dateien auswählen
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
          />
        </label>
      </div>

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {uploadedImages.map((img, index) => (
            <div key={index} className="group relative">
              <Image
                src={img.preview}
                alt={`Upload ${index + 1}`}
                width={128}
                height={128}
                className={`h-32 w-full rounded-lg object-cover ${
                  img.isPrimary ? "ring-2 ring-blue-500" : ""
                }`}
              />
              <div className="absolute inset-0 flex items-center justify-center space-x-2 rounded-lg bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => setPrimaryImage(index)}
                  className="rounded-full bg-white p-2 hover:bg-gray-100"
                  title="Als Hauptbild setzen"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeImage(index)}
                  className="rounded-full bg-white p-2 hover:bg-gray-100"
                  title="Entfernen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {img.isPrimary && (
                <span className="absolute left-2 top-2 rounded bg-blue-500 px-2 py-1 text-xs text-white">
                  Hauptbild
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Zusammenfassung</h2>

      <div className="space-y-4 rounded-lg bg-gray-50 p-6">
        <div>
          <h3 className="font-semibold text-gray-700">Grundinformationen</h3>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between">
              <dt className="text-gray-600">Titel:</dt>
              <dd className="font-medium">{formData.title}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Aktenzeichen:</dt>
              <dd className="font-medium">{formData.case_number}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Kategorie:</dt>
              <dd className="font-medium">{formData.category}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Priorität:</dt>
              <dd className="font-medium">{formData.priority}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700">Beschreibung</h3>
          <p className="mt-2 text-gray-600">{formData.short_description}</p>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700">Kontakt</h3>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between">
              <dt className="text-gray-600">Ort:</dt>
              <dd className="font-medium">{formData.location}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Dienststelle:</dt>
              <dd className="font-medium">{formData.station}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700">Bilder</h3>
          <p className="mt-2 text-gray-600">
            {uploadedImages.length} Bild(er) hochgeladen
          </p>
        </div>
      </div>

      <div className="flex items-start rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <AlertCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
        <div>
          <p className="text-sm text-yellow-800">
            Bitte überprüfen Sie alle Angaben sorgfältig. Nach dem Absenden wird
            die Fahndung aktiviert.
          </p>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Grundinfo" },
    { number: 2, title: "Beschreibung" },
    { number: 3, title: "Kontakt" },
    { number: 4, title: "Bilder" },
    { number: 5, title: "Überprüfung" },
  ];

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  currentStep >= step.number
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <span className="ml-2 text-sm font-medium">{step.title}</span>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-1 w-16 ${
                    currentStep > step.number ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-lg bg-white p-8 shadow-lg">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center rounded-lg px-4 py-2 ${
              currentStep === 1
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-gray-500 text-white hover:bg-gray-600"
            }`}
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Zurück
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Weiter
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center rounded-lg bg-green-500 px-6 py-2 text-white hover:bg-green-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Fahndung erstellen
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
