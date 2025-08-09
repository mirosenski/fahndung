// Typdefinitionen für die JSON-Presets, um "any" zu vermeiden
export type TextTemplate = {
  Titel?: string[];
  Beschreibung?: string[];
};

export type PresetsShape = {
  Vermisst?: Record<string, TextTemplate>;
  Straftaeter?: Record<string, TextTemplate>;
  UnbekannteTote?: Record<string, TextTemplate>;
  Sachen?: { Fahrrad?: TextTemplate };
};
