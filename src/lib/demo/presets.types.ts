// Typdefinitionen für die JSON-Presets, um "any" zu vermeiden
export type TextTemplate = {
  Titel?: string[];
  Beschreibung?: string[];
};

export type PresetsShape = {
  Vermisst?: { Standard?: TextTemplate };
  Straftaeter?: Record<string, TextTemplate>;
  UnbekannteTote?: { Standard?: TextTemplate };
  Sachen?: { Fahrrad?: TextTemplate };
};
