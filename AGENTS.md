# Projektregeln für die Rezeptsammlung

## Ziel

Dieses Projekt ist eine persönliche, druckbare Rezeptsammlung. Neue Rezepte können aus einem vom Nutzer bereitgestellten Foto, Screenshot oder Webseiten-Link übernommen werden.

## Verbindlicher Ablauf für neue Rezepte

1. Quelle vollständig lesen bzw. das Bild sorgfältig auswerten.
2. Rezeptname, Zubereitungszeiten, Portionen, Zutaten und Zubereitung extrahieren. Nichts erfinden, wenn die Quelle eine Angabe enthält.
3. Fehlende, aber für das Rezept zwingend nötige Angaben klar und sparsam ergänzen; Ergänzungen in `source.note` dokumentieren.
4. Mengen und Einheiten auf gut lesbare deutsche Schreibweise normalisieren, ohne die Mengenverhältnisse zu verändern. Besteht ein Rezept aus mehreren Komponenten (z. B. Teig, Belag, Creme oder Glasur), erhält jede Zutat das passende optionale Feld `group`; jede neue Gruppe wird im Zutatenblock als eigene Zwischenüberschrift dargestellt. Gruppennamen nicht in `item` wiederholen.
5. Jeden Arbeitsschritt als vollständigen, kurzen Satz formulieren. Keine werblichen Einleitungen oder unnötigen Geschichten übernehmen.
6. Das Rezept als neuen Datensatz in `data/recipes.json` eintragen und dieselben Daten in der Browser-Kopie `data/recipes.js` ergänzen. Bestehende Rezepte nicht überschreiben. Die `id` besteht aus einem eindeutigen deutschen Slug.
7. Für jedes Rezept ein appetitliches, textfreies Gerichtsfoto unter `assets/images/<id>.*` ablegen. Ein vom Nutzer bereitgestelltes Bild bevorzugen; andernfalls ein neues Bild generieren. Bildrechte bzw. Quelle in `source.note` kenntlich machen.
8. Das gewählte Layout aus `selectedLayout` verwenden. Vor der Layoutentscheidung bleiben alle drei Varianten erhalten.
9. Alle Rezeptkarten verwenden dieselbe gut lesbare Standardschriftgröße; die Schrift für umfangreiche Rezepte nicht verkleinern. Zunächst prüfen, ob das Rezept auf eine DIN-A5-Seite passt. Bei langen Rezepten Formulierungen kürzen und Abstände moderat anpassen; keine Zutaten oder Arbeitsschritte entfernen. Reicht eine Seite mit der Standardschrift nicht aus, das Rezept mit `cardPages: 2` auf zwei DIN-A5-Karten aufteilen: Titel, Bild und Zutaten auf Karte 1, Zubereitung und Tipp auf Karte 2. Bei zweispaltigen Zutatenlisten jede Zeile in einer expliziten Spalte rendern und prüfen, dass mehrzeilige Einträge nicht am Spaltenwechsel abgeschnitten werden.
10. JSON und JavaScript validieren und die Seite sowohl direkt per Doppelklick auf `index.html` als auch über einen lokalen Webserver prüfen.

## Pflichtfelder pro Rezept

`id`, `name`, `description`, `prepTime`, `cookTime`, `totalTime`, `servings`, `difficulty`, `tags`, `ingredients`, `steps`, `tip`, `image`, `imageAlt`, `source`.

## Spätere Kochvorschläge

Wenn der Nutzer nach einer Kochidee fragt:

- ausschließlich vorhandene Rezepte aus `data/recipes.json` berücksichtigen, sofern nichts anderes gewünscht ist;
- Vorlieben, verfügbare Zeit, Portionen und vorhandene Zutaten einbeziehen, wenn genannt;
- 1 bis 3 passende Rezepte mit kurzer Begründung vorschlagen;
- anschließend eine zusammengefasste Einkaufsliste ausgeben;
- gleiche Zutaten zusammenfassen und bereits vorhandene Zutaten weglassen;
- bei Mengenänderungen alle Zutaten proportional zur gewünschten Portionszahl skalieren.

## Stil

Sprache: Deutsch. Ton: klar, freundlich, knapp. Maßeinheiten: g, kg, ml, l, TL, EL. Temperaturen in °C. Zeiten als `X Min.` bzw. `X Std. Y Min.`.
