"use client";

import React, { useState, useRef, useEffect } from "react";
// Importiere nur benötigte Icons einzeln, um Tree‑Shaking zu ermöglichen
import FileTextIcon from "@lucide-react/file-text";
import AlertCircleIcon from "@lucide-react/alert-circle";
import BoldIcon from "@lucide-react/bold";
import ItalicIcon from "@lucide-react/italic";
import UnderlineIcon from "@lucide-react/underline";
import ListIcon from "@lucide-react/list";
import ListOrderedIcon from "@lucide-react/list-ordered";
import QuoteIcon from "@lucide-react/quote";
import LinkIcon from "@lucide-react/link";
import ImageIcon from "@lucide-react/image";
import CodeIcon from "@lucide-react/code";
import Heading1Icon from "@lucide-react/heading-1";
import Heading2Icon from "@lucide-react/heading-2";
import EyeIcon from "@lucide-react/eye";
import Edit3Icon from "@lucide-react/edit-3";
import HashIcon from "@lucide-react/hash";
import SmileIcon from "@lucide-react/smile";
import SparklesIcon from "@lucide-react/sparkles";
import Wand2Icon from "@lucide-react/wand-2";
import LanguagesIcon from "@lucide-react/languages";
import CheckCircleIcon from "@lucide-react/check-circle";
import XIcon from "@lucide-react/x";
import PlusIcon from "@lucide-react/plus";
import MinusIcon from "@lucide-react/minus";

interface DescriptionCategoryProps {
  data: any;
  isEditMode: boolean;
  updateField: (step: string, field: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

/**
 * ModernDescriptionCategory
 *
 * Diese Komponente bietet einen umfassenden, aber leichten Markdown‑Editor
 * für die Fahndungsbeschreibung. Sie unterstützt grundlegende Formatierung
 * über Markdown‑Syntax (fett, kursiv, Unterstreichung, Zitat, Code) und
 * erlaubt das Hinzufügen von Tags. Ein Vorschaumodus rendert das Ergebnis
 * serverlos, indem einfache Reguläre Ausdrücke eingesetzt werden. Die
 * Import‑Icons werden einzeln geladen, um den Bundle zu verkleinern.
 */
export default function ModernDescriptionCategory({
  data,
  isEditMode,
  updateField,
  onNext,
  onPrevious,
}: DescriptionCategoryProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [selectedText, setSelectedText] = useState("");
  const [showToolbar, setShowToolbar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    data?.step2?.tags || [],
  );
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);

  // Vorschläge für Tags, Emojis und AI‑Text
  const suggestedTags = [
    "dringend",
    "vermisst",
    "gesucht",
    "gefährlich",
    "bewaffnet",
    "jugendlich",
    "erwachsen",
    "männlich",
    "weiblich",
    "fahrzeug",
    "diebstahl",
    "betrug",
    "gewalt",
    "bundesweit",
    "regional",
  ];

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

  // Aktualisiere Wort‑ und Zeichenanzahl sowie Lesezeit, sobald sich der Text ändert
  useEffect(() => {
    const text: string = data?.step2?.description || "";
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
    setReadingTime(Math.ceil(words.length / 200));
  }, [data?.step2?.description]);

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
    const currentText: string = data?.step2?.description || "";
    let formattedText = currentText;
    switch (format) {
      case "bold":
        formattedText = currentText.replace(selectedText, `**${selectedText}**`);
        break;
      case "italic":
        formattedText = currentText.replace(selectedText, `*${selectedText}*`);
        break;
      case "underline":
        formattedText = currentText.replace(selectedText, `<u>${selectedText}</u>`);
        break;
      case "quote":
        formattedText = currentText.replace(selectedText, `> ${selectedText}`);
        break;
      case "code":
        formattedText = currentText.replace(selectedText, `\`${selectedText}\``);
        break;
    }
    updateField("step2", "description", formattedText);
    setShowToolbar(false);
  };

  // Tag hinzufügen
  const addTag = (tag: string) => {
    if (!tag || selectedTags.includes(tag)) return;
    const newTags = [...selectedTags, tag];
    setSelectedTags(newTags);
    updateField("step2", "tags", newTags);
    setTagInput("");
    setShowTagSuggestions(false);
  };

  // Tag entfernen
  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
    updateField("step2", "tags", newTags);
  };

  // AI‑Vorschlag einfügen
  const insertAISuggestion = (suggestion: string) => {
    const currentText: string = data?.step2?.description || "";
    updateField("step2", "description", currentText + "\n\n" + suggestion);
    setShowAISuggestions(false);
  };

  // Emoji einfügen
  const insertEmoji = (emoji: string) => {
    const currentText: string = data?.step2?.description || "";
    updateField("step2", "description", currentText + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Kopfbereich mit Statistiken */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/50 p-3 backdrop-blur-sm dark:bg-white/10">
              <FileTextIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Detaillierte Beschreibung
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Erstellen Sie eine umfassende Fallbeschreibung
              </p>
            </div>
          </div>
          {/* Statistikanzeigen */}
          <div className="flex items-center gap-4 text-sm">
            <div className="rounded-xl bg-white/50 px-3 py-2 backdrop-blur-sm dark:bg-white/10">
              <span className="text-gray-600 dark:text-gray-400">Wörter:</span>
              <span className="ml-1 font-semibold text-gray-900 dark:text-white">{wordCount}</span>
            </div>
            <div className="rounded-xl bg-white/50 px-3 py-2 backdrop-blur-sm dark:bg-white/10">
              <span className="text-gray-600 dark:text-gray-400">Zeichen:</span>
              <span className="ml-1 font-semibold text-gray-900 dark:text-white">{charCount}</span>
            </div>
            <div className="rounded-xl bg-white/50 px-3 py-2 backdrop-blur-sm dark:bg-white/10">
              <span className="text-gray-600 dark:text-gray-400">Lesezeit:</span>
              <span className="ml-1 font-semibold text-gray-900 dark:text-white">~{readingTime} Min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Haupteditor */}
      <div className="rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-800">
        {isEditMode ? (
          <>
            {/* Tabs */}
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab("write")}
                  className={
                    activeTab === "write"
                      ? "flex items-center gap-2 border-b-2 border-indigo-600 px-4 py-2 font-medium text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                      : "flex items-center gap-2 px-4 py-2 font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }
                >
                  <Edit3Icon className="h-4 w-4" /> Schreiben
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={
                    activeTab === "preview"
                      ? "flex items-center gap-2 border-b-2 border-indigo-600 px-4 py-2 font-medium text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                      : "flex items-center gap-2 px-4 py-2 font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }
                >
                  <EyeIcon className="h-4 w-4" /> Vorschau
                </button>
              </div>
              {/* Text‑Größensteuerung */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize((prev) => Math.max(12, prev - 1))}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">{fontSize}px</span>
                <button
                  onClick={() => setFontSize((prev) => Math.min(24, prev + 1))}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Formatierungsleiste */}
            {activeTab === "write" && (
              <div className="mb-4 flex flex-wrap items-center gap-1 rounded-xl bg-gray-50 p-2 dark:bg-gray-900">
                <button
                  onClick={() => applyFormat("bold")}
                  className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <BoldIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => applyFormat("italic")}
                  className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ItalicIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => applyFormat("underline")}
                  className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </button>
                <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <button className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800">
                  <Heading1Icon className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800">
                  <Heading2Icon className="h-4 w-4" />
                </button>
                <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <button className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800">
                  <ListIcon className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800">
                  <ListOrderedIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => applyFormat("quote")}
                  className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <QuoteIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => applyFormat("code")}
                  className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <CodeIcon className="h-4 w-4" />
                </button>
                <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <button className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800">
                  <LinkIcon className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800">
                  <ImageIcon className="h-4 w-4" />
                </button>
                <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="rounded-lg p-2 text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <SmileIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-2 text-white hover:shadow-lg"
                >
                  <SparklesIcon className="h-4 w-4" />
                </button>
              </div>
            )}
            {/* Emoji‑Picker */}
            {showEmojiPicker && (
              <div className="mb-4 flex flex-wrap gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                {quickEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => insertEmoji(emoji)}
                    className="rounded-lg p-2 text-2xl hover:bg-white hover:shadow-sm dark:hover:bg-gray-800"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            {/* AI‑Vorschläge */}
            {showAISuggestions && (
              <div className="mb-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:from-purple-950 dark:to-pink-950">
                <div className="mb-3 flex items-center gap-2">
                  <Wand2Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Schreibvorschläge</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => insertAISuggestion(suggestion)}
                      className="rounded-xl bg-white/50 px-3 py-2 text-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md dark:bg-white/10 dark:hover:bg-white/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Haupt‑Textfeld oder Vorschau */}
            {activeTab === "write" ? (
              <div
                ref={editorRef}
                className="relative"
                onMouseUp={handleTextSelection}
              >
                <textarea
                  value={data?.step2?.description || ""}
                  onChange={(e) => updateField("step2", "description", e.target.value)}
                  className="min-h-[400px] w-full rounded-xl border-2 border-gray-200 p-4 text-gray-900 transition-all focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400"
                  placeholder={
                    "Beginnen Sie mit der Beschreibung des Falls...\n\n" +
                    "/ für Befehle\n@ für Personen\n# für Tags"
                  }
                  style={{ fontSize: `${fontSize}px`, lineHeight }}
                />
                {showToolbar && selectedText && (
                  <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-xl bg-gray-900 p-2 shadow-2xl dark:bg-gray-700">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => applyFormat("bold")}
                        className="rounded p-2 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                      >
                        <BoldIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => applyFormat("italic")}
                        className="rounded p-2 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                      >
                        <ItalicIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => applyFormat("underline")}
                        className="rounded p-2 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                      >
                        <UnderlineIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="prose prose-lg max-w-none rounded-xl bg-gray-50 p-6 dark:bg-gray-900 dark:prose-invert">
                <div
                  className="whitespace-pre-wrap"
                  style={{ fontSize: `${fontSize}px`, lineHeight }}
                  dangerouslySetInnerHTML={{
                    __html: (data?.step2?.description || "Keine Beschreibung vorhanden")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/`(.*?)`/g, "<code>$1</code>")
                      .replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>")
                      // Unterstreichungen generieren
                      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {data?.step2?.description || "Keine Beschreibung verfügbar."}
            </div>
          </div>
        )}
      </div>
      {/* Merkmale Section */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:from-blue-950 dark:to-cyan-950">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-white/50 p-3 backdrop-blur-sm dark:bg-white/10">
            <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Besondere Merkmale</h3>
        </div>
        {isEditMode ? (
          <textarea
            value={data?.step2?.features || ""}
            onChange={(e) => updateField("step2", "features", e.target.value)}
            className="min-h-[200px] w-full rounded-xl border-2 border-blue-200 bg-white/50 p-4 backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none dark:border-blue-800 dark:bg-gray-900/50 dark:focus:border-blue-400"
            placeholder="Besondere Kennzeichen, Auffälligkeiten, Verhaltensweisen..."
          />
        ) : (
          <div className="rounded-xl bg-white/50 p-4 backdrop-blur-sm dark:bg-gray-900/50">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {data?.step2?.features || "Keine besonderen Merkmale angegeben."}
            </p>
          </div>
        )}
      </div>
      {/* Tags & Kategorien */}
      <div className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:from-green-950 dark:to-emerald-950">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-white/50 p-3 backdrop-blur-sm dark:bg-white/10">
            <HashIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tags & Kategorien</h3>
        </div>
        {isEditMode ? (
          <div className="space-y-4">
            {/* Tag‑Eingabe */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagSuggestions(e.target.value.length > 0);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  className="flex-1 rounded-xl border-2 border-green-200 bg-white/50 px-4 py-2 backdrop-blur-sm transition-all focus:border-green-500 focus:outline-none dark:border-green-800 dark:bg-gray-900/50 dark:focus:border-green-400"
                  placeholder="Tag hinzufügen..."
                />
                <button
                  onClick={() => addTag(tagInput)}
                  className="rounded-xl bg-green-600 p-2 text-white hover:bg-green-700"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              {/* Vorschläge */}
              {showTagSuggestions && (
                <div className="absolute top-full z-10 mt-2 w-full rounded-xl bg-white p-2 shadow-xl dark:bg-gray-800">
                  {suggestedTags
                    .filter((tag) => tag.toLowerCase().includes(tagInput.toLowerCase()))
                    .slice(0, 5)
                    .map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => addTag(tag)}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HashIcon className="mr-2 inline h-3 w-3" />
                        {tag}
                      </button>
                    ))}
                </div>
              )}
            </div>
            {/* Ausgewählte Tags */}
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-white"
                >
                  <HashIcon className="h-3 w-3" />
                  <span className="text-sm font-medium">{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 opacity-70 transition-opacity hover:opacity-100"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            {/* Schnellauswahl */}
            <div className="flex flex-wrap gap-2 pt-2">
              <p className="w-full text-xs text-gray-600 dark:text-gray-400">Schnellauswahl:</p>
              {suggestedTags.slice(0, 8).map((tag, index) => (
                <button
                  key={index}
                  onClick={() => addTag(tag)}
                  className="rounded-xl bg-white/50 px-3 py-1 text-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md dark:bg-white/10 dark:hover:bg-white/20"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedTags.length > 0 ? (
              selectedTags.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-white"
                >
                  <HashIcon className="h-3 w-3" />
                  <span className="text-sm font-medium">{tag}</span>
                </span>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Keine Tags angegeben.</p>
            )}
          </div>
        )}
      </div>
      {/* Rechtschreibprüfung */}
      {isEditMode && (
        <div className="rounded-3xl bg-gradient-to-br from-yellow-50 to-orange-50 p-6 dark:from-yellow-950 dark:to-orange-950">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/50 p-3 backdrop-blur-sm dark:bg-white/10">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Qualitätsprüfung</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Rechtschreibung geprüft</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Grammatik korrekt</span>
                </div>
                <div className="flex items-center gap-2">
                  <LanguagesIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Sprache: Deutsch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 rounded-2xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Zurück zur Übersicht
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
        >
          Weiter zu Medien
        </button>
      </div>
      {/* Validierungswarnung */}
      {!data?.step2?.description && (
        <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
          <div className="flex items-center gap-3">
            <AlertCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Beschreibung fehlt</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Eine detaillierte Beschreibung ist wichtig für die Fahndung.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}