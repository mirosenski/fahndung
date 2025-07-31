/**
 * SEO-Utilities für Fahndungs-URLs
 * Generiert SEO-freundliche URLs basierend auf Titel und Fallnummer
 */

export function generateSeoSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(
      /[äöüß]/gi,
      (m) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[m] ?? m,
    )
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") // Entferne führende und abschließende Bindestriche
    .trim();
}

/**
 * Validiert einen SEO-Slug gegen die generierte Version
 */
export function validateSeoSlug(slug: string, title: string): boolean {
  const expectedSlug = generateSeoSlug(title);
  return slug === expectedSlug;
}

/**
 * Findet eine Fahndung basierend auf dem Titel-Slug
 * Da wir keine Fallnummer mehr im Slug haben, müssen wir die Fahndung anders finden
 */
export async function findInvestigationBySlug(
  slug: string,
  api: unknown,
): Promise<string | null> {
  try {
    // Lade alle Fahndungen und suche nach dem passenden Titel
    const investigations = await (
      api as {
        post: {
          getInvestigations: (params: {
            limit: number;
            offset: number;
          }) => Promise<Array<{ title: string; case_number: string }>>;
        };
      }
    ).post.getInvestigations({
      limit: 50,
      offset: 0,
    });

    for (const investigation of investigations) {
      const expectedSlug = generateSeoSlug(investigation.title);
      if (expectedSlug === slug) {
        return investigation.case_number;
      }
    }

    return null;
  } catch {
    console.error("Fehler beim Suchen der Fahndung");
    return null;
  }
}

/**
 * Generiert eine SEO-URL für eine Fahndung
 */
export function generateSeoUrl(title: string): string {
  const slug = generateSeoSlug(title);
  return `/fahndungen/${slug}`;
}

/**
 * Generiert eine SEO-URL für eine Fahndung mit Fallback auf die Standard-URL
 */
export function getFahndungUrl(title: string, caseNumber: string): string {
  try {
    return generateSeoUrl(title);
  } catch {
    // Fallback auf Standard-URL
    return `/fahndungen/${caseNumber}`;
  }
}

/**
 * Generiert eine SEO-URL für die Bearbeitung einer Fahndung
 */
export function getFahndungEditUrl(title: string, caseNumber: string): string {
  try {
    const slug = generateSeoSlug(title);
    return `/fahndungen/${slug}?edit=true`;
  } catch {
    // Fallback auf Standard-URL
    return `/fahndungen/${caseNumber}?edit=true`;
  }
}
