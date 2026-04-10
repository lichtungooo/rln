# Trust

**Status:** Vision, Stand 2026-04-10

## Das Wesen

Trust ist die Vertrauens-Schicht unter allen Modulen des Real Life Network. Sie trägt die Identität jedes Menschen und die Verbindungen, die aus echter Begegnung wachsen. Jeder Mensch besitzt seine Identität selbst — sicher im eigenen Gerät, geschützt durch klare Kryptographie, frei von zentralen Registern.

## Die drei Kernaussagen

**Identität gehört dem Menschen.** Jeder Mensch hat einen eigenen, kryptographischen Schlüssel. Er entsteht aus zwölf magischen Worten (BIP39), die der Mensch sich notiert und an einem sicheren Ort aufbewahrt. Daraus wächst ein öffentlicher Bezeichner (did:key), der ihn im Netzwerk auffindbar macht.

**Vertrauen entsteht in Begegnung.** Zwei Menschen treffen sich im wirklichen Leben, scannen gegenseitig einen QR-Code, und aus diesem Moment erwächst eine bestätigte Verbindung. Jede weitere gemeinsame Erfahrung — eine erlebte Quest, ein gelungener Tausch, ein gehaltenes Versprechen — stärkt das Band.

**Verschlüsselung schützt, was geteilt wird.** Alles, was Menschen miteinander teilen, wird verschlüsselt. Die Server sehen nur Chiffrate, niemals den Inhalt. So bleibt die Intimität der Gemeinschaft gewahrt, auch wenn die Infrastruktur des Netzes öffentlich sichtbar ist.

## Wie es sich anfühlt

Für den Menschen fühlt sich Trust still an. Er öffnet die App, meldet sich an, und alles ist da. Die Schlüssel arbeiten im Hintergrund, die Verschlüsselung läuft von selbst, und die Verbindungen zu anderen Menschen sind einfach sichtbar. Nur wenn eine neue Verbindung entsteht — beim QR-Scan in einer Begegnung — wird der Trust für einen Augenblick bewusst. Sonst trägt er ruhig und unauffällig.

## Was das Modul leistet

- **Identität anlegen** aus zwölf magischen Worten
- **Identität wiederherstellen** auf einem neuen Gerät mit den gleichen zwölf Worten
- **Begegnung bestätigen** durch QR-Scan zwischen zwei Menschen
- **Vertrauen zeigen** — wem habe ich vertraut, wer vertraut mir
- **Verbindungen verwalten** — benennen, beschreiben, bei Bedarf zurückziehen
- **Verschlüsselung bereitstellen** für alle anderen Module

## Trust-Tokens — eine spätere Erweiterung

Aus Timos Vision wächst eine besondere Idee: **Trust-Tokens** als physische Gegenstände. Ein Ring, ein Amulett, ein Armband — mit einem kleinen NFC-Chip, der die Identität trägt. Damit können Kinder an Quests teilnehmen, ohne ein Handy zu besitzen. Menschen bezahlen an Marktständen, indem sie ihren Ring an ein Lesegerät halten. Künstler aus der Gemeinschaft gestalten diese Tokens und bringen sie in die Welt.

Diese Vision ist groß und braucht eigene Zeit. Sie lebt zunächst als Konzept weiter und findet später ihren technischen Weg.

## Das Fundament, auf dem wir bauen

Der Trust wächst nicht aus dem Nichts. Antons Team hat im Projekt *Web of Trust* bereits ein reifes Fundament geschaffen: `wot-core` ist als Paket veröffentlicht, 64 Tests bestehen, die Kryptographie folgt klaren Standards (Ed25519 für Signaturen, X25519 für Schlüsselaustausch, AES-256-GCM für Inhalte). Das Real Life Network übernimmt diesen Kern und gibt ihm den klaren Namen **Trust**.

## Was Trust nicht ist

- **Kein Login mit Passwort.** Die Identität liegt in den zwölf Worten, nicht in einem Server-Konto.
- **Keine Bewertungsplattform.** Trust zeigt gelebte Verbindungen, keine Sterne oder Punkte.
- **Keine soziale Überwachung.** Was Menschen miteinander tun, bleibt zwischen ihnen.

## Offene Gedanken

- Wie zeigt sich Vertrauen in der Oberfläche, ohne in Zahlen und Balken zu rutschen?
- Wie bringt ein Mensch einen anderen in sein Netz, der noch keine Identität hat?
- Wie reist die Identität zwischen Geräten, wenn jemand sein Handy verliert?

Diese Fragen finden ihre Antworten im Tun.

---

*Grundlage: github.com/real-life-org/web-of-trust — dort lebt der technische Kern.*
