"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { getErrorMessage } from "@/types/errors";
import { api } from "@/trpc/react";

const editSchema = z.object({
  title: z.string().min(5, "Titel muss mindestens 5 Zeichen haben"),
  case_number: z.string().min(3, "Aktenzeichen ist erforderlich"),
  category: z.enum([
    "WANTED_PERSON",
    "MISSING_PERSON",
    "UNKNOWN_DEAD",
    "STOLEN_GOODS",
  ]),
  priority: z.enum(["normal", "urgent", "new"]),
  status: z.enum(["draft", "active", "published", "closed"]),
  date: z.string().min(1, "Datum ist erforderlich"),
  short_description: z
    .string()
    .min(20, "Kurzbeschreibung muss mindestens 20 Zeichen haben")
    .max(500),
  description: z
    .string()
    .min(50, "Beschreibung muss mindestens 50 Zeichen haben"),
  features: z.string().optional(),
  location: z.string().min(3, "Ort ist erforderlich"),
  station: z.string().min(3, "Dienststelle ist erforderlich"),
  contact_info: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
  }),
  tags: z.array(z.string()).optional(),
});

type EditFormData = z.infer<typeof editSchema>;

export default function FahndungBearbeitenPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  // Direct tRPC query
  const {
    data: investigation,
    isLoading: loading,
    error,
  } = api.post.getInvestigation.useQuery(
    { id: id as string },
    {
      enabled: !!id,
    },
  );

  // Effect to handle investigation data
  useEffect(() => {
    if (investigation) {
      console.log("🔍 Investigation loaded:", investigation);
      form.reset({
        title: investigation.title ?? "",
        case_number: investigation.case_number ?? "",
        category:
          (investigation.category as
            | "MISSING_PERSON"
            | "WANTED_PERSON"
            | "UNKNOWN_DEAD"
            | "STOLEN_GOODS") ?? "MISSING_PERSON",
        priority: investigation.priority ?? "normal",
        status:
          (investigation.status as
            | "draft"
            | "active"
            | "published"
            | "closed") ?? "active",
        date: investigation.date?.split("T")[0] ?? "",
        short_description: investigation.short_description ?? "",
        description: investigation.description ?? "",
        features: investigation.features ?? "",
        location: investigation.location ?? "",
        station: investigation.station ?? "",
        contact_info: investigation.contact_info ?? {},
        tags: investigation.tags ?? [],
      });
      setTagInput(investigation.tags?.join(", ") ?? "");
    }
  }, [investigation, form]);

  // Update mutation
  const updateInvestigationMutation = api.post.updateInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndung erfolgreich aktualisiert");
      router.push(`/fahndungen/${id as string}`);
    },
    onError: (error) => {
      toast.error("Fehler beim Aktualisieren: " + getErrorMessage(error));
    },
  });

  const onSubmit = async (data: EditFormData) => {
    setIsSubmitting(true);
    try {
      await updateInvestigationMutation.mutateAsync({
        id: id as string,
        ...data,
      });
    } catch (error: unknown) {
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-gray-600">Fahndung nicht gefunden</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold">Fahndung bearbeiten</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 rounded-lg bg-white p-6 shadow-sm"
        >
          {/* Basic Info */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Grundinformationen</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Titel *
                </label>
                <input
                  {...form.register("title")}
                  className="input-dark-mode"
                />
                {form.formState.errors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Aktenzeichen *
                </label>
                <input
                  {...form.register("case_number")}
                  className="input-dark-mode"
                />
                {form.formState.errors.case_number && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.case_number.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Kategorie *
                </label>
                <select
                  {...form.register("category")}
                  className="select-dark-mode"
                >
                  <option value="WANTED_PERSON">Straftäter</option>
                  <option value="MISSING_PERSON">Vermisste Person</option>
                  <option value="UNKNOWN_DEAD">Unbekannte Tote</option>
                  <option value="STOLEN_GOODS">Sachen</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Priorität *
                </label>
                <select
                  {...form.register("priority")}
                  className="select-dark-mode"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Dringend</option>
                  <option value="new">Neu</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Status *
                </label>
                <select
                  {...form.register("status")}
                  className="select-dark-mode"
                >
                  <option value="draft">Entwurf</option>
                  <option value="active">Aktiv</option>
                  <option value="published">Veröffentlicht</option>
                  <option value="closed">Geschlossen</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Datum *
                </label>
                <input
                  type="date"
                  {...form.register("date")}
                  className="input-dark-mode"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Beschreibung</h2>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Kurzbeschreibung *
              </label>
              <textarea
                {...form.register("short_description")}
                rows={3}
                className="textarea-dark-mode"
              />
              {form.formState.errors.short_description && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.short_description.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Ausführliche Beschreibung *
              </label>
              <textarea
                {...form.register("description")}
                rows={6}
                className="textarea-dark-mode"
              />
              {form.formState.errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Besondere Merkmale
              </label>
              <textarea
                {...form.register("features")}
                rows={3}
                className="textarea-dark-mode"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Tags (mit Komma trennen)
              </label>
              <input
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  const tags = e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag);
                  form.setValue("tags", tags);
                }}
                className="input-dark-mode"
                placeholder="z.B. Betrug, Gewalt, Vermisst"
              />
            </div>
          </div>

          {/* Location & Contact */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Ort & Kontakt</h2>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Ort *</label>
                <input
                  {...form.register("location")}
                  className="input-dark-mode"
                />
                {form.formState.errors.location && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.location.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Dienststelle *
                </label>
                <input
                  {...form.register("station")}
                  className="input-dark-mode"
                />
                {form.formState.errors.station && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.station.message}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 font-medium">Ansprechpartner</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">Name</label>
                  <input
                    {...form.register("contact_info.name")}
                    className="input-dark-mode"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Telefon
                  </label>
                  <input
                    {...form.register("contact_info.phone")}
                    className="input-dark-mode"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    E-Mail
                  </label>
                  <input
                    {...form.register("contact_info.email")}
                    type="email"
                    className="input-dark-mode"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 border-t pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Speichern
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
