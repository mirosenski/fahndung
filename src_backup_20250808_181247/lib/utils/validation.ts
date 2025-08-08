/**
 * Validierungsfunktionen für Fahndungs-IDs
 */

/**
 * Validiert eine Fahndungs-ID
 * @param id - Die zu validierende ID
 * @returns true wenn die ID gültig ist, false sonst
 */
export function isValidInvestigationId(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  const trimmedId = id.trim();
  if (trimmedId.length === 0) {
    return false;
  }
  
  return true;
}

/**
 * Validiert eine UUID
 * @param id - Die zu validierende UUID
 * @returns true wenn es eine gültige UUID ist, false sonst
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validiert eine Fallnummer
 * @param id - Die zu validierende Fallnummer
 * @returns true wenn es eine gültige Fallnummer ist, false sonst
 */
export function isValidCaseNumber(id: string): boolean {
  const caseNumberRegex = /^(?:POL-)?\d{4}-[A-Z]-\d{3,6}(?:-[A-Z])?$/;
  return caseNumberRegex.test(id);
}

/**
 * Bestimmt den Typ einer Fahndungs-ID
 * @param id - Die zu analysierende ID
 * @returns 'uuid' | 'case_number' | 'invalid'
 */
export function getInvestigationIdType(id: string): 'uuid' | 'case_number' | 'invalid' {
  if (!isValidInvestigationId(id)) {
    return 'invalid';
  }
  
  if (isValidUUID(id)) {
    return 'uuid';
  }
  
  if (isValidCaseNumber(id)) {
    return 'case_number';
  }
  
  return 'invalid';
}

/**
 * Normalisiert eine Fahndungs-ID (entfernt Whitespace)
 * @param id - Die zu normalisierende ID
 * @returns Die normalisierte ID oder null wenn ungültig
 */
export function normalizeInvestigationId(id: string | null | undefined): string | null {
  if (!isValidInvestigationId(id)) {
    return null;
  }
  
  return id!.trim();
}
