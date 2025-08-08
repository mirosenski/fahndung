"use client";

import React, { useState, useRef } from "react";
import {
  AlertCircle as AlertCircleIcon,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Quote as QuoteIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  Heading1 as Heading1Icon,
  Heading2 as Heading2Icon,
  Eye as EyeIcon,
  Edit3 as Edit3Icon,
  Smile as SmileIcon,
  Sparkles as SparklesIcon,
  Wand2 as Wand2Icon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  FileText as FileTextIcon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";

import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface DescriptionCategoryProps {
  data: UIInvestigationData;
  isEditMode: boolean;
  updateField: (
    step: keyof UIInvestigationData,
    field: string,
    value: unknown,
  ) => void;
}

/**
 * ModernDescriptionCategory
 *
 * Diese Komponente bietet einen umfassenden, aber leichten Markdown‑Editor
 * für die Fahndungsbeschreibung. Sie unterstützt grundlegende Formatierung
 * über Markdown‑Syntax (fett, kursiv, Unterstreichung, Zitat, Code) und
 * erlaubt das Hinzufügen von Tags. Ein Vorschaumodus rendert das Ergebnis
 * serverlos, indem einfache Reguläre Ausdrücke eingesetzt werden.
 */
export default function ModernDescriptionCategory({
  data,
  isEditMode,
  updateField,
}: DescriptionCategoryProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [selectedText, setSelectedText] = useState("");
  const [showToolbar, setShowToolbar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);


  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight] = useState(1.6);

  const step2 = data.step2 ?? {
    description: "",
    features: "",
    tags: [],
  };

  // Vorschläge für Tags, Emojis und AI‑Text
  const quickEmojis = [
    "⚠️",
    "🚨",
    "📍",
    "🚗",
    "👤",
    "📱",
    "💼",
    "🏠",
    "⏰",
    "📅",
  ];

  const aiSuggestions = [
    "Zuletzt gesehen am...",
    "Besondere Merkmale sind...",
    "Die Person wird verdächtigt...",
    "Hinweise bitte an...",
    "Vorsicht ist geboten, da...",
  ];

  // Selektion für Toolbar ermitteln
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  // Formatierung anwenden
  const applyFormat = (format: string) => {
    const currentText: string = step2.description ?? "";
    let formattedText = currentText;
    switch (format) {
      case "bold":
        formattedText = currentText.replace(
          selectedText,
          `**${selectedText}**`,
        );
        break;
      case "italic":
        formattedText = currentText.replace(selectedText, `*${selectedText}*`);
        break;
      case "underline":
        formattedText = currentText.replace(
          selectedText,
          `<u>${selectedText}</u>`,
        );
        break;
      case "quote":
        formattedText = currentText.replace(selectedText, `> ${selectedText}`);
        break;
      case "code":
        formattedText = currentText.replace(
          selectedText,
          `\`${selectedText}\``,
        );
        break;
    }
    updateField("step2", "description", formattedText);
    setShowToolbar(false);
  };

  // AI‑Vorschlag einfügen
  const insertAISuggestion = (suggestion: string) => {
    const currentText: string = step2.description ?? "";
    updateField("step2", "description", currentText + "\n\n" + suggestion);
    setShowAISuggestions(false);
  };

  // Emoji einfügen
  const insertEmoji = (emoji: string) => {
    const currentText: string = step2.description ?? "";
    updateField("step2", "description", currentText + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-800">
      {/* Hauptbeschreibung */}
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Beschreibung
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Detaillierte Beschreibung des Falls
          </p>
        </div>
        {isEditMode ? (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1">
                <Button
                  variant={activeTab === "write" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("write")}
                  className="flex items-center gap-2"
                >
                  <Edit3Icon className="h-4 w-4" />
                  Schreiben
                </Button>
                <Button
                  variant={activeTab === "preview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("preview")}
                  className="flex items-center gap-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  Vorschau
                </Button>
              </div>
              {/* Text‑Größensteuerung */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFontSize((prev) => Math.max(12, prev - 1))}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="min-w-[40px] text-center text-sm text-gray-600 dark:text-gray-400">
                  {fontSize}px
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFontSize((prev) => Math.min(24, prev + 1))}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Formatierungsleiste */}
            {activeTab === "write" && (
              <div className="flex flex-wrap items-center gap-1 rounded-xl bg-gray-50 p-2 dark:bg-gray-900">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormat("bold")}
                  className="h-8 w-8 p-0"
                >
                  <BoldIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormat("italic")}
                  className="h-8 w-8 p-0"
                >
                  <ItalicIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormat("underline")}
                  className="h-8 w-8 p-0"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
                <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Heading1Icon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Heading2Icon className="h-4 w-4" />
                </Button>
                <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ListIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ListOrderedIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormat("quote")}
                  className="h-8 w-8 p-0"
                >
                  <QuoteIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormat("code")}
                  className="h-8 w-8 p-0"
                >
                  <CodeIcon className="h-4 w-4" />
                </Button>
                <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="h-8 w-8 p-0"
                >
                  <SmileIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <SparklesIcon className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Emoji‑Picker */}
            {showEmojiPicker && (
              <div className="flex flex-wrap gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                {quickEmojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => insertEmoji(emoji)}
                    className="h-10 w-10 p-0 text-2xl hover:bg-white hover:shadow-sm dark:hover:bg-gray-800"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            )}

            {/* AI‑Vorschläge */}
            {showAISuggestions && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Wand2Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      AI Schreibvorschläge
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => insertAISuggestion(suggestion)}
                        className="bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-md dark:bg-white/10 dark:hover:bg-white/20"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Haupt‑Textfeld oder Vorschau */}
            {activeTab === "write" ? (
              <div
                ref={editorRef}
                className="relative"
                onMouseUp={handleTextSelection}
              >
                <Textarea
                  value={step2.description ?? ""}
                  onChange={(e) =>
                    updateField("step2", "description", e.target.value)
                  }
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  className={`min-h-[400px] resize-none border-2 transition-all ${
                    focusedField === "description"
                      ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  placeholder={
                    "Beginnen Sie mit der Beschreibung des Falls...\n\n" +
                    "/ für Befehle\n@ für Personen\n# für Tags"
                  }
                  style={{ fontSize: `${fontSize}px`, lineHeight }}
                />
                {showToolbar && selectedText && (
                  <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-xl bg-gray-900 p-2 shadow-2xl dark:bg-gray-700">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => applyFormat("bold")}
                        className="h-8 w-8 p-0 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                      >
                        <BoldIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => applyFormat("italic")}
                        className="h-8 w-8 p-0 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                      >
                        <ItalicIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => applyFormat("underline")}
                        className="h-8 w-8 p-0 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                      >
                        <UnderlineIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="prose prose-lg dark:prose-invert max-w-none rounded-xl bg-gray-50 p-6 dark:bg-gray-900">
                <div
                  className="whitespace-pre-wrap"
                  style={{ fontSize: `${fontSize}px`, lineHeight }}
                  dangerouslySetInnerHTML={{
                    __html: (
                      step2.description ?? "Keine Beschreibung vorhanden"
                    )
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/`(.*?)`/g, "<code>$1</code>")
                      .replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>")
                      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>"),
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {step2.description || "Keine Beschreibung verfügbar."}
            </div>
          </div>
        )}
      </div>

      {/* Kurzbeschreibung */}
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Kurzbeschreibung
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wichtige Merkmale und Kennzeichen
          </p>
        </div>
        {isEditMode ? (
          <Textarea
            value={step2.features ?? ""}
            onChange={(e) => updateField("step2", "features", e.target.value)}
            onFocus={() => setFocusedField("features")}
            onBlur={() => setFocusedField(null)}
            className={`min-h-[120px] resize-none border-2 transition-all ${
              focusedField === "features"
                ? "border-orange-500 ring-2 ring-orange-200 dark:ring-orange-800"
                : "border-gray-200 dark:border-gray-700"
            }`}
            placeholder="Wichtige Merkmale, Kennzeichen, Auffälligkeiten..."
          />
        ) : (
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {step2.features ?? "Keine Kurzbeschreibung angegeben."}
            </p>
          </div>
        )}
      </div>

      {/* Besondere Merkmale */}
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Besondere Merkmale
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Narben, Tattoos, besondere Kleidung, Auffälligkeiten
          </p>
        </div>
        {isEditMode ? (
          <Textarea
            value={step2.features ?? ""}
            onChange={(e) => updateField("step2", "features", e.target.value)}
            onFocus={() => setFocusedField("features")}
            onBlur={() => setFocusedField(null)}
            className={`min-h-[120px] resize-none border-2 transition-all ${
              focusedField === "features"
                ? "border-cyan-500 ring-2 ring-cyan-200 dark:ring-cyan-800"
                : "border-gray-200 dark:border-gray-700"
            }`}
            placeholder="z.B. Narben, Tattoos, besondere Kleidung, Auffälligkeiten..."
          />
        ) : (
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {step2.features ?? "Keine besonderen Merkmale angegeben."}
            </p>
          </div>
        )}
      </div>

      {/* Zusätzliche Dokumente */}
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Zusätzliche Dokumente
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            PDF, Word, Bilder und andere Dateien
          </p>
        </div>
        {isEditMode ? (
          <div className="space-y-4">
            {/* Datei-Upload */}
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <FileTextIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Dateien hochladen
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Dateien auswählen
              </Button>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                PDF, Word, Excel, Bilder (max. 10MB pro Datei)
              </p>
            </div>
            {/* Hochgeladene Dateien */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Hochgeladene Dateien:
              </h4>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Noch keine Dateien hochgeladen
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">
              Keine zusätzlichen Dokumente verfügbar.
            </p>
          </div>
        )}
      </div>

      {/* Validierungswarnung */}
      {!step2.description && (
        <Card className="border-2 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Beschreibung fehlt
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Eine detaillierte Beschreibung ist wichtig für die Fahndung.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
