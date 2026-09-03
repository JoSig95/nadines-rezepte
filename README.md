# Meine Rezeptsammlung

Eine persönliche Rezeptsammlung im kompakten, druckoptimierten DIN-A5-Layout.

## Sammlung öffnen

Einfach `index.html` doppelt anklicken. Die Sammlung funktioniert ohne Installation und ohne lokalen Webserver.

Alternativ kann sie über einen kleinen lokalen Webserver geöffnet werden:

```powershell
python -m http.server 8000
```

Danach `http://localhost:8000` im Browser öffnen. Mit der Schaltfläche oben rechts kann das aktuelle Rezept gedruckt werden.

## Drucken

Der Druckbogen ist auf DIN A4 im Querformat angelegt. Im Bereich „Druckbogen belegen“ können die linke und rechte DIN-A5-Hälfte unabhängig ausgewählt oder leer gelassen werden. So lässt sich ein einzelnes Rezept links oder rechts beziehungsweise zwei beliebige Rezepte nebeneinander drucken. Eine feine gestrichelte Mittellinie dient als Schneidehilfe.

Farben und Bilder werden mit der CSS-Einstellung `print-color-adjust: exact` an den Druckdialog übergeben. Im Druckdialog zusätzlich „Farbe“ statt „Graustufen“ wählen, da eine Webseite die Einstellung des physischen Druckers nicht erzwingen kann.

Die strukturierte Hauptdatei ist `data/recipes.json`. Für das direkte Öffnen im Browser enthält `data/recipes.js` eine identische Kopie. Bei neuen Rezepten werden beide Dateien aktualisiert.

## Gewähltes Layout

Layout 3 (`compact`) ist in `data/recipes.json` als verbindlicher Stil festgelegt. Die zwei früheren Entwürfe bleiben im Code als Reserve erhalten, werden in der Sammlung aber nicht mehr angeboten.

## Neue Rezepte hinzufügen

Die dauerhaften Import- und Stilregeln stehen in `AGENTS.md`. Dadurch kann ein später in der GPT-App bereitgestelltes Rezeptfoto oder ein Link konsistent in `data/recipes.json` und `assets/images/` übernommen werden.
