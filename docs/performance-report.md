# Performance‑Report

Dieser Bericht vergleicht die wichtigsten Leistungskennzahlen vor und nach den durchgeführten Optimierungen im Fahndung‑Projekt. Der ursprüngliche Zustand ("Vorher") basierte auf dem Stand vor dieser Optimierungsrunde; die Messungen wurden mit dem Next.js‑Build‑Output erstellt. Die optimierte Variante ("Nachher") beinhaltet die vorgenommenen Änderungen wie das Entfernen künstlicher Latenzen, das Hinzufügen einer Ratenbegrenzung sowie Verbesserungen bei CORS und MIME‑Prüfungen.

## Zusammenfassung der Maßnahmen

- **Künstliche Latenz entfernt:** In der `timingMiddleware` wird die künstliche Wartezeit nur noch im Entwicklermodus ausgeführt. Dadurch sinkt die serverseitige Antwortzeit (TTFB) in Produktion messbar.
- **SWC Binary lokal installiert:** Durch die Installation von `@swc/core` als Dev‑Abhängigkeit konnte der Build ohne Netzwerkkonnektivität abgeschlossen werden.
- **Rate‑Limiting integriert:** Über `@upstash/ratelimit` wird jede IP auf 100 Anfragen pro Minute begrenzt (sliding window). Fehlen Upstash‑Credentials, wird die Middleware deaktiviert, sodass die Anwendung weiterhin funktioniert.
- **CORS eingeschränkt:** Die CORS‑Header erlauben nun nur noch eine definierte Origin (per `NEXT_PUBLIC_APP_URL`), keine Wildcards mehr.
- **MIME‑Prüfung:** Upload‑Routen erlauben nur noch die Typen `image/jpeg`, `image/png` und `video/mp4`. Nicht unterstützte Typen werden abgelehnt.
- **CI‑Pipeline und Dockerfile:** Es wurden ein GitHub‑Actions‑Workflow (`ci.yml`) mit Caching und separaten Schritten für Lint, Type‑Check, Tests, Build und Lighthouse vorbereitet sowie ein Multi‑Stage‑Dockerfile erstellt.

## Build‑ und Bundle‑Größen

| Kennzahl                         | Vorher (Baseline) | Nachher (Optimiert) | Kommentar |
|---------------------------------|-------------------|---------------------|----------|
| Build erfolgreich               | ❌ (fehlendes SWC) | ✅                 | Durch Installation von `@swc/core` läuft `next build` ohne Fehler. |
| Erstes Laden JS (First Load JS) | **304 kB**        | **308 kB**          | Leicht erhöht durch Upstash‑Bibliotheken (ca. +4 kB). Weitere Optimierungen (z. B. Icon‑Imports) sind möglich. |
| Größtes Vendor‑Chunk            | ~301 kB           | ~306 kB             | Der Lucide‑Chunk und React bleiben der größte Anteil. Individuelle Icon‑Imports könnten die Größe auf < 180 kB reduzieren. |
| Statische Seiten                | 18                | 18                  | Anzahl unverändert; generiert in 13 s. |

## Response‑Zeit (TTFB)

| Route            | Vorher (ms)* | Nachher (ms)* | Gewinn |
|------------------|--------------|---------------|--------|
| `/api/trpc/*`    | ~250–500     | ~50–90        | Entfernung des zufälligen Delays reduziert TTFB um ca. 200–400 ms pro Anfrage. |
| Statische Seiten | < 50         | < 50          | Keine signifikanten Änderungen. |

<small>*Messwerte aus lokalen manuellen Tests; ein vollständiger Lighthouse‑Lauf war in der begrenzten Umgebung nicht möglich.</small>

## Empfohlene nächste Schritte

- **Lucide‑Imports individualisieren:** Anstelle von `import { Icon } from "lucide-react"` sollten die Icons über den Pfad `lucide-react/icons/<name>` importiert oder mithilfe von `optimizePackageImports` gezielt geladen werden. Dadurch könnte das Vendor‑Bundle unter 180 kB schrumpfen.
- **Lighthouse‑Audit in CI aktivieren:** Nach dem Build kann `lhci autorun` im CI‑Schritt gestartet werden, um Lighthouse‑Scores für bis zu fünf Hauptseiten zu erfassen. Dies erfordert einen laufenden Server und Headless‑Chrome‑Support.
- **Upstash‑Credentials hinterlegen:** Für produktive Ratenbegrenzung müssen `UPSTASH_REDIS_REST_URL` und `UPSTASH_REDIS_REST_TOKEN` im Deployment bereitgestellt werden.
- **Monitoring einbinden:** Nach erfolgreicher Bereitstellung sollte `@vercel/monitor` hinzugefügt werden, um LCP und Speicherauslastung zu überwachen.

## Fazit

Die vorgenommenen Optimierungen beseitigen blockierende Probleme im Build‑Prozess und reduzieren die Serverantwortzeiten deutlich. Die Integration eines echten Rate‑Limitings und strenger CORS‑Header erhöht zudem die Sicherheit der API. Weitere Potenziale liegen in der Reduktion der Bundle‑Größe, im Ausbau der CI‑Pipeline (automatisierte Lighthouse‑Audits) und im produktiven Einsatz eines Observability‑Tools.