# Handwerks-Skill-Landschaft — Recherche-Bericht

*Recherche-Agent 1 von 6 · Eingang: 2026-05-13*

## Kernerkenntnisse

- **Drei amtliche Schubladen tragen das deutsche Handwerk: HwO Anlage A (53 zulassungspflichtige Gewerke), B1 (42 zulassungsfreie Gewerke), B2 (52 handwerksaehnliche Gewerke). 147 Gewerke insgesamt — eine fertige Top-Ebene fuer den Tree.** Quelle: [ZDH Anlage A](https://www.zdh.de/daten-und-fakten/handwerksordnung/gewerbe-der-handwerksordnung-anlage-a/), [ZDH Anlage B1/B2](https://www.zdh.de/daten-und-fakten/handwerksordnung/gewerbe-anlage-b1-und-b2/).
- **ESCO ist ein Geschenk: 3.039 Berufe und 13.939 Skills, mehrsprachig, offiziell freigegeben fuer beliebige Nutzung — auch fuer unsere App.** Die Linked-Open-Data-Struktur liefert Verbindungen, die wir sonst selbst bauen muessten. [ESCO Download](https://esco.ec.europa.eu/en/use-esco/download).
- **DIN EN ISO 9606-1 zeigt die richtige Granularitaet: Jedes Schweissverfahren ist eine eigene Pruefung. WIG, MAG, Elektrode — drei eigene Skill-Knoten. Das Prinzip "ein Verfahren = ein Skill" laesst sich auf alle Gewerke uebertragen.** [DVS-Media Poster](https://www.dvs-media.eu/media/pdf/schweisserpruefung-din-en-iso-9606-1-poster.pdf).
- **DQR/EQR liefert die Tiefe-Achse: 8 Niveaus, vier Dimensionen (Wissen, Fertigkeiten, Sozialkompetenz, Selbststaendigkeit). Erstausbildung landet auf 4, Meister auf 6. Unser Tree braucht eine vergleichbare Achse von Schnupperkurs bis Meister.** [DQR-Niveaus](https://www.dqr.de/dqr/de/der-dqr/dqr-niveaus/deutscher-qualifikationsrahmen-dqr-niveaus.html).
- **Bestehende Skill-Tree-Plattformen bedienen Software, Gaming, Selbstoptimierung — keine bedient deutsches Handwerk fuer Kinder und Jugendliche. Die Luecke ist gross.**

---

## 1. Offizielle Strukturen

| Quelle | Inhalt | Logik | Nutzbar als |
|--------|--------|-------|-------------|
| HwO Anlage A | 53 Gewerke, zulassungspflichtig (Meisterzwang) | Gefahrgeneigte Berufe (Elektrik, Gas, Sanitaer, Bau, Fleischer, Augenoptik...) | Top-Ebene "Gefahr-relevant" |
| HwO Anlage B1 | 42 Gewerke, zulassungsfrei | Freiwilliger Meister moeglich (Tischler, Goldschmied, Uhrmacher...) | Top-Ebene "Frei zugaenglich" |
| HwO Anlage B2 | 52 handwerksaehnliche Gewerke | Niedrige Eintrittsschwelle (Bodenleger, Fliegenschuetzbauer, Anglerbedarfshersteller...) | Top-Ebene "Einstiegsfaehig" |
| BBiG / HwO Ausbildungsordnungen | Pro Beruf eine Verordnung, gefasst in **Lernfelder** und **Lernziele** | Atomar formulierte Mindestanforderungen — Wissen, Fertigkeiten, Faehigkeiten | Mittel-Ebene "Lernfeld" |
| [DQR](https://www.dqr.de/) | 8 Niveaus, 4 Dimensionen | Bildungsstufen quer durch alle Bereiche | Vertikale Achse (Anfaenger -> Meister) |
| [EQR](https://www.dqr.de/dqr/de/der-dqr/dqr-und-eqr/deutscher-qualifikationsrahmen-dqr-und-eqr.html) | Europaeisches Pendant | Vergleichbarkeit ueber Laender | Spaeter fuer Europa-Rollout |
| [ESCO](https://esco.ec.europa.eu/en/classification) | 3.039 Berufe + 13.939 Skills, Linked Open Data | Skills sind den Berufen zugeordnet, hierarchisch in 4 Ebenen gegliedert | **Daten-Fundament fuer Skill-Knoten** |
| [BERUFENET](https://web.arbeitsagentur.de/berufenet/) | Datenbank der Arbeitsagentur, Taetigkeiten + Ausbildungsbeschreibungen | Beruf -> Taetigkeit -> Hilfsmittel | Komplementaer-Quelle, deutschsprachig |

Die Quartett-Logik HwO + BBiG + DQR + ESCO ergibt ein vollstaendiges Geruest. ESCO traegt die Verbindungen ("Skill X gehoert zu Beruf Y"), DQR traegt die Hoehe, HwO traegt die deutschen Gewerke-Namen, BBiG traegt die konkreten Lernziele pro Beruf.

---

## 2. Atomare Skill-Granularitaet

Die Pruefungsordnungen geben die Antwort. Beispiele:

**Schweissen.** [DIN EN ISO 9606-1](https://www.dvs-home.de/fileadmin/Images/Landesverbaende/Suedwest-B/KS_Neckarsulm/Pruef-NormDINENISO9606-1.pdf) verlangt fuer jedes Verfahren eine eigene Schweisserpruefung. Eine Person mit WIG-Pruefung darf nicht ohne Weiteres MAG-Schweissen. Daraus folgt: **WIG, MAG, Elektroden-Schweissen, Autogen-Schweissen** sind vier eigenstaendige Skill-Knoten. Zusaetzlich gestaffelt nach Position (PA, PB, PC, PD, PE, PF) und Werkstoff (Stahl, Edelstahl, Aluminium).

**Holzwerken.** Die [Tischler-Ausbildungsordnung](https://www.tischler-schreiner.de/fileadmin/master/der_beruf/ausbildung/downloads/Ausbildungsordnung.pdf) unterscheidet Saegen, Hobeln, Schleifen, Bohren, Fraesen, Drechseln, Furnieren, Verleimen, Oberflaeche-Behandeln. **Saegen wiederum spaltet sich nach Werkzeug auf**: Handsaege, Stichsaege, Kreissaege, Bandsaege, Tischkreissaege. Jedes Werkzeug hat eigene Sicherheitsregeln und eigene Bewegungsmuster.

**Mauern.** Die [Maurer-Lernfelder](https://www.qua-lis.nrw.de/lernfelder-buendelungsfaecher-maurer-maurerin) trennen Mauern (einschalig, zweischalig, Bogen), Putzen (Innen, Aussen), Estrich, Beton-Verarbeitung (Bewehrung, Schalung, Mischungen), Daemmung.

**Elektronik.** [Elektroniker-Grundausbildung](https://c.wgr.de/d/d40862e6d002f2e3916cab6e3ff81865995251501bb80087a60316ec1931435f.pdf/978-3-427-44010-9_07.pdf) trennt Schaltplan-Lesen, Schaltplan-Zeichnen, Loeten (Hand vs. Reflow), Bestuecken, Messen, Inbetriebnehmen, Fehler-Suchen.

**Empfehlung:** Drei-Stufen-Granularitaet im Tree.
1. **Gewerk-Knoten** (z. B. "Holzwerken") — Sammelebene
2. **Technik-Knoten** (z. B. "Saegen", "Hobeln") — Mittel-Ebene
3. **Werkzeug-Knoten** (z. B. "Handsaege", "Stichsaege", "Kreissaege") — atomarer Skill

Jeder Werkzeug-Knoten traegt: Sicherheitsregeln, Voraussetzungen, Probe-Aufgabe ("Schneide ein Brett auf 30 cm Laenge mit Toleranz 2 mm"), erkennbares Ergebnis.

---

## 3. Cross-Skills

In allen Ausbildungsordnungen tauchen Themen auf, die quer durch alle Gewerke gebraucht werden. [Schluesselqualifikationen](https://de.wikipedia.org/wiki/Schl%C3%BCsselqualifikation) nennt die Soziologie das. Wir nennen sie **Wurzel-Skills**, weil sie unter allen Gewerken liegen.

Die wichtigsten Cross-Skills aus Ausbildungsordnungen und [DGUV-Regeln](https://www.dguv.de/fb-bildungseinrichtungen/sachgebiete/schulen/orga/index.jsp):

- **Mass nehmen** (Zollstock, Massband, Schieblehre, Wasserwaage, Laser)
- **Skizze lesen + zeichnen** (Riss, Schnitt, Aufriss, Bemassung, Massstab)
- **Material erkennen** (Holz-Arten, Stahl-Sorten, Stein-Sorten, Kunststoff-Sorten)
- **Arbeitsplatz organisieren** (Vorbereiten, Aufraeumen, Werkzeug-Pflege)
- **Sicherheit** (PSA, Handhabung gefaehrlicher Stoffe, Sturzschutz, Augen-Schutz, Gehoer-Schutz)
- **Erste Hilfe** (Schnitte, Verbrennungen, Splitter)
- **Rechnen** (Volumen, Flaeche, Material-Bedarf, Mischungs-Verhaeltnisse, Dreisatz)
- **Werkzeug-Pflege** (Schaerfen, Oelen, Lagern)
- **Teamwork + Auftrag annehmen** (Kunden-Gespraech, Uebergabe)

Diese Wurzel-Skills sind im Tree die unteren Knoten — alles andere setzt darauf auf. Sie sind auch fuer Kinder gut zugaenglich (ausser Spezialthemen wie Gas-Sicherheit oder Hochspannung).

---

## 4. Voraussetzungs-Logik

Die Realitaet kennt drei Sorten Voraussetzungen:

**Pflicht-Voraussetzung (gesetzlich).** Das [Jugendarbeitsschutzgesetz](https://www.gesetze-im-internet.de/jarbschg/BJNR009650976.html) verbietet Kindern unter 15 fast jede Arbeit an Maschinen. Schweissen, Saegen mit Kreissaege, Schmieden am offenen Feuer — fuer Jugendliche braucht es Sicherheitsunterweisung alle sechs Monate. Im Tree zeigen wir das als **Alters-Tor**: Knoten leuchtet erst ab 14 oder 15 oder mit Erwachsenen-Begleitung.

**Wissens-Voraussetzung (didaktisch).** Aus den Ausbildungsordnungen ergibt sich eine Reihenfolge: Mass nehmen kommt vor Saegen, Saegen kommt vor Verleimen, Verleimen kommt vor Moebel-Bauen. Mauern mit einfachem Verband kommt vor zweischaligem Mauerwerk, dieses vor Bogen-Konstruktion. Loeten kommt vor Schaltung-Aufbauen, dieses vor Fehler-Diagnose.

**Werkzeug-Voraussetzung (praktisch).** Bevor du eine Tisch-Kreissaege bedienst, musst du eine Stich- oder Handkreissaege beherrschen. Bevor du WIG-Schweissen kannst, brauchst du sichere Hand und Material-Verstaendnis. Bevor du Elektronik-Schaltungen aufbaust, musst du loeten koennen.

**Dokumentations-Quellen fuer Voraussetzungen.**
- IHK-Pruefungsverordnungen pro Beruf
- HWK-Ausbildungsrahmenplaene
- [DIN-Normen](https://www.dinmedia.de/) fuer technische Verfahren
- DGUV-Regeln fuer Sicherheit
- Lehrplaene der Berufsschulen ([KMK-Rahmenlehrplaene](https://www.kmk.org/themen/berufliche-schulen/duale-berufsausbildung/rahmenlehrplaene-und-ausbildungsordnungen.html))

Im Tree bauen wir Voraussetzungen als **Kanten** zwischen Knoten ab. Drei Kanten-Typen:
1. **Pflicht** (rot, blockiert): Erst freischalten, dann betreten
2. **Empfohlen** (gelb, durchlaessig): Geht ohne, geht aber besser mit
3. **Synergie** (gruen, optional): Macht den Knoten leichter, verkuerzt die Zeit

---

## 5. Handwerks-Bereiche

### Holzwerken (Tischler/Schreiner, [Ausbildungsordnung](https://www.tischler-schreiner.de/fileadmin/master/der_beruf/ausbildung/downloads/Ausbildungsordnung.pdf))

| Skill | Voraussetzung | Kinder ab | Notiz |
|-------|---------------|-----------|-------|
| Holz erkennen (10 Arten) | — | 8 | Riech-Probe, Maserung |
| Mass nehmen + anreissen | — | 8 | Bleistift, Zollstock, Anschlagswinkel |
| Handsaege fuehren | Mass | 10 | Fuchsschwanz, Japan-Saege |
| Stichsaege | Handsaege, Sicherheit | 12 | Brille, Gehoerschutz |
| Bohren mit Akkuschrauber | Sicherheit | 10 | Bohrer-Sorten |
| Schleifen | — | 8 | Koernung verstehen |
| Schrauben + Duebeln | Bohren | 10 | Vorbohren, Senken |
| Hobeln | Mass, Materialverstaendnis | 12 | Putzhobel, Schlichthobel |
| Verleimen | Mass | 10 | Holz-Leim, Zwingen |
| Drechseln | Mass, Sicherheit | 14 | Drehbank, Stecheisen |
| Oberflaeche oelen | Schleifen | 10 | Hartoel, Wachs |
| Zinken-Verbindung | Saegen, Stechen | 14 | Schwalbenschwanz |

### Metall: Schweissen ([DIN EN ISO 9606-1](https://www.dvs-media.eu/media/pdf/schweisserpruefung-din-en-iso-9606-1-poster.pdf))

| Skill | Voraussetzung | Kinder ab | Notiz |
|-------|---------------|-----------|-------|
| Metall erkennen | — | 10 | Magnet-Test, Funken-Probe |
| Feilen | — | 10 | Hieb-Sorten |
| Saegen mit Buegelsaege | Mass | 10 | Saegeblatt-Sorten |
| Bohren in Metall | Bohren-Holz | 12 | Kuehl-Schmierung |
| Gewinde-Schneiden | Bohren-Metall | 14 | Schneideisen, Gewindebohrer |
| Loeten (Weichloet) | — | 12 | Loetkolben, Flussmittel |
| Hartloeten | Weichloeten | 16 | Brenner, Loet-Stab |
| Autogen-Schweissen | Sicherheit, Material | 16 | Gas-Flaschen |
| Elektroden-Schweissen | Sicherheit | 16 | Elektroden-Sorten |
| MAG-Schweissen | Elektroden | 16 | Schutzgas |
| WIG-Schweissen | MAG, ruhige Hand | 18 | Praezision, Edelstahl |

### Metall: Schmieden ([Burgenlandschmiede](https://burgenlandschmiede.com/kurse/), [Schmiedekurse Schweiz](https://www.schmiede.ch/schmiede/Kurse.html))

| Skill | Voraussetzung | Kinder ab | Notiz |
|-------|---------------|-----------|-------|
| Feuer anzuenden + halten | — | 10 | Esse, Kohle, Luftzufuhr |
| Gluehfarben lesen | Feuer | 10 | Kirschrot, Gelb, Weiss |
| Hammer fuehren | — | 8 | Schmiedehammer, Schlag-Rhythmus |
| Anspitzen | Hammer, Feuer | 10 | Konische Form |
| Breiten | Anspitzen | 10 | Hammerfinne |
| Stauchen | Breiten | 12 | Material verdichten |
| Verdrehen | Anspitzen | 12 | Spirale |
| Biegen am Amboss | Hammer | 10 | Horn-Nutzung |
| Lochen | Sicherheit | 12 | Locheisen |
| Spalten | Hammer + Sicherheit | 14 | Setzhammer |
| Messer schmieden | alle obigen + Haerten | 16 | Klingen-Geometrie |

### Garten + Pflanzenbau ([Gaertner-Lehrplan NRW](https://www.berufsbildung.nrw.de/cms/upload/_lehrplaene/a/gaertner.pdf), [Schulgarten](https://www.backwinkel.de/blog/schulgarten/))

| Skill | Voraussetzung | Kinder ab | Notiz |
|-------|---------------|-----------|-------|
| Boden erkennen | — | 6 | Lehm, Sand, Humus |
| Saen | Boden | 6 | Reihen, Tiefe |
| Pikieren | Saen | 8 | Setzlinge umtopfen |
| Pflanzen-Bestimmung (20 Arten) | — | 8 | Bestimmungsschluessel |
| Giessen + Wasser-Bedarf | — | 6 | Tageszeit, Menge |
| Kompost anlegen | — | 8 | Material-Schichtung |
| Hochbeet bauen | Holz-Skills, Boden | 10 | Schichten-Aufbau |
| Veredeln + Pfropfen | Pflanzen, Schnitt | 12 | Okulieren |
| Baum-Schnitt | Pflanzen-Wissen | 14 | Astung, Krone |
| Permakultur-Design | alle obigen | 14 | Zonen, Polykultur |

### Elektronik + Loeten ([Elektroniker-Grundausbildung](https://c.wgr.de/d/d40862e6d002f2e3916cab6e3ff81865995251501bb80087a60316ec1931435f.pdf/978-3-427-44010-9_07.pdf))

| Skill | Voraussetzung | Kinder ab | Notiz |
|-------|---------------|-----------|-------|
| Stromkreis verstehen | — | 8 | Plus/Minus, Batterie, Lampe |
| Schaltbild lesen | Stromkreis | 10 | Symbole |
| Steckbrett-Schaltung | Schaltbild | 10 | Breadboard |
| Loetkolben sicher fuehren | Sicherheit | 12 | Lot, Flussmittel, Schwamm |
| Bauteile loeten | Loetkolben | 12 | Widerstand, LED, Kondensator |
| Messen mit Multimeter | Stromkreis | 12 | Spannung, Strom, Widerstand |
| Mikrocontroller-Programmierung (Arduino) | Schaltbild, Loeten | 12 | Blinkende LED, Servo |
| 230V-Hausinstallation | DQR 4, Pflicht: Profi | 18 | Pruefungspflicht |

### Bauen + Renovieren (Maurer-Lernfelder)

| Skill | Voraussetzung | Kinder ab | Notiz |
|-------|---------------|-----------|-------|
| Mauerstein erkennen | — | 8 | Ziegel, Kalksandstein, Porenbeton |
| Moertel mischen | Material | 10 | Sand, Zement, Wasser |
| Wand mauern (gerade) | Moertel, Wasserwaage | 12 | Halbverband, Laeuferverband |
| Putz auftragen | Moertel | 12 | Reibebrett |
| Beton mischen | Material | 12 | Mischungsverhaeltnis |
| Schalung bauen | Holz-Skills | 14 | Brett-Schalung |
| Bewehrung legen | Schalung | 14 | Eisen-Korb |
| Estrich gluetten | Beton | 14 | Latte abziehen |
| Daemmung einbauen | Mauern | 12 | WDVS |

### Reparieren + Upcycling ([Repair-Cafe-Netzwerk](https://www.reparatur-initiativen.de/orte))

| Skill | Voraussetzung | Kinder ab | Notiz |
|-------|---------------|-----------|-------|
| Fehler-Diagnose | Beobachtung | 10 | Hoeren, Riechen, Schauen |
| Schraub-Verbindungen oeffnen | Werkzeug-Kunde | 8 | Kreuzschlitz, Schlitz, Torx, Imbus |
| Klebe-Verbindungen loesen | Material | 10 | Heissluft, Aceton |
| Naehmaschine bedienen | — | 10 | Faden einfaedeln, Naht naehen |
| Fahrrad-Reifen flicken | Werkzeug | 10 | Schlauch, Flicken |
| Kabel-Bruch reparieren | Loeten | 12 | Isolieren, Crimpen |
| Holz-Bruch leimen | Verleimen | 10 | Zwingen-Druck |
| Polster aufarbeiten | Naehen | 12 | Schaumstoff, Stoff |
| Lack ausbessern | Schleifen, Material | 12 | Grundierung, Schicht |

---

## 6. Bestehende Skill-Tree-Versuche

| Plattform | Inhalt | Bewertung | Lektion fuer uns |
|-----------|--------|-----------|------------------|
| [SkillTree (NSA Open Source)](https://github.com/NationalSecurityAgency/skills-service) | Micro-Learning-Gamification, Skill-Definition + Punkte + Abzeichen | Solides Daten-Modell, Software-orientiert | Datenstruktur als Referenz |
| [Easy SkillTree](https://easyskilltree.com/about/) | Self-Improvement-App, Skill-Tree fuer persoenliche Ziele | Solo-Tool, kein Handwerk-Fokus | Visuelle Sprache anschauen |
| [Project SkillTree](https://www.projectskilltree.com/) | Habit-Tracker als Skill-Tree | Self-Improvement, kein Werk-Ergebnis | Belohnungs-Logik klauen |
| [Duolingo](https://duolingoguides.com/all-duolingo-achievements/) | Sprach-Lernen mit Skill-Baum + Abzeichen | Massentauglich, klare Progression | Quest-Rhythmus, Streak-Mechanik |
| [MYSKILLS Bertelsmann](https://www.bertelsmann-stiftung.de/en/our-projects/identifying-occupational-skills/description) | Kompetenz-Test fuer 30 Berufe (Migranten-Programm) | Inhaltlich wertvoll, in Praxis gescheitert | Inhalte sind brauchbare Steinbrueche |
| [BERUFENET](https://web.arbeitsagentur.de/berufenet/) | Berufe-Datenbank mit Taetigkeiten | Daten-Schatz, hat aber keinen Tree | Quelle fuer deutsche Berufs-Skills |
| [HORNBACH macht Schule](https://hornbach-macht-schule.de/) | Projekt-basiertes Handwerk-Lernen, Klassen 8-10 | Echte Projekte, sehr nah an unserer Idee | **Partner-Anknuepfung** |
| [Open Badges + Microcredentials](https://www.instructure.com/resources/blog/microcredentials-vs-open-badges-navigating-landscape-digital-learning-recognition) | Standard fuer digital nachweisbare Skills | Etabliert, interoperabel | **Trust-Token-Anbindung** |

**Misserfolge:** MYSKILLS hat trotz solider Inhalte keine breite Akzeptanz gefunden — zu test-lastig, zu beamten-haft, ohne Spielcharakter. Skill-Tree-Apps im Self-Improvement-Bereich versanden meist nach 4-6 Wochen, weil das Werk-Ergebnis fehlt.

**Erfolge:** Duolingo zeigt, dass Skill-Trees mit Streak + Sozial-Druck + sichtbarem Fortschritt funktionieren. SkillTree (NSA Open Source) zeigt, dass Punkte + Abzeichen + Levels in echter Lern-Software funktionieren. HORNBACH macht Schule zeigt, dass echte Projekte und Werkstaetten Schueler erreichen.

---

## 7. Empfehlung fuer unseren Tree

**Was wir uebernehmen.**

ESCO ist unser Skill-Steinbruch. Wir laden die 13.939 Skills + 3.039 Berufe als Linked Open Data, filtern auf Handwerk-Berufe (HwO A/B1/B2) und nehmen ESCO-Skill-IDs als unsere internen Skill-IDs. Damit sind wir europaeisch anschlussfaehig und sparen die Definition von Tausenden Skills. Die Lizenz-Bedingung ("This service uses the ESCO classification of the European Commission") nehmen wir gern in den Footer.

DQR-Niveaus 1-8 werden unsere vertikale Achse. Jeder Skill-Knoten bekommt ein DQR-Niveau. Schnupperkurs liegt auf 1-2, Lehre auf 3-4, Geselle auf 4, Meister auf 6. Damit ist die Vertikale geeicht, ohne dass wir sie selbst erfinden.

HwO Anlage A/B1/B2 wird die oberste Gewerke-Sortierung — 147 Gewerke, schon fertig nummeriert. Pro Gewerk ein Stamm im Tree.

**Was wir eigen bauen.**

Die **Wurzel-Skills** (Mass, Skizze, Sicherheit, Material, Werkzeug-Pflege, Arbeitsplatz, Rechnen, Erste Hilfe, Teamwork) baut wir als eigene Schicht UNTER den Gewerken. ESCO hat sie verteilt, wir buendeln sie. Sie sind die "Gemeinsame Wurzel" — die Tiefenschicht, von der alle Gewerke abgehen.

Die **Voraussetzungs-Kanten** sind unser eigentlicher Mehrwert. ESCO traegt sie nicht. Wir bauen ein Kanten-Modell mit drei Typen (Pflicht, Empfohlen, Synergie) und mappen Voraussetzungen aus Ausbildungsordnungen, Pruefungs-Normen (DIN EN ISO 9606 fuer Schweissen, DIN-Normen fuer Holz, etc.) und Sicherheits-Vorgaben (JArbSchG, DGUV).

Die **Alters-Tore** sind ein zweites eigenes Layer. Pro Skill-Knoten ein empfohlenes Mindest-Alter, abgeleitet aus JArbSchG, DGUV-Schulregeln und Schmiede-/Werk-Kurs-Praxis. Kinder unter dem Mindest-Alter sehen den Knoten in der Karte, koennen aber nur mit Erwachsenen-Begleitung den Quest starten.

Die **Verlinkung mit echten Quests + Werkstaetten** ist der RLN-Hebel. Jeder Skill-Knoten kann mit einem Marktplatz-Eintrag, einem Kalender-Termin (Repair-Cafe, Schmiede-Kurs, Tischler-Tag der offenen Tuer), einer Quest oder einem Macher-Profil verbunden werden. Damit wird der Tree nicht eine flache App, sondern die Karte ins echte Leben.

**Schliesslich: Open Badges + Trust-Tokens.** Wenn ein Mensch einen Skill-Knoten meistert (Quest abgeschlossen, Werk gezeigt, Pate bestaetigt), bekommt er ein Trust-Token bzw. ein Open-Badge-konformes Mikro-Zeugnis. Damit hat das Lernen ein hartes Artefakt, das auch ausserhalb des RLN gilt — anschlussfaehig an Schulen, Bewerbungen, Stipendien.

---

## Quellen

**Offizielle Strukturen**
- [ZDH — Handwerksordnung Anlage A](https://www.zdh.de/daten-und-fakten/handwerksordnung/gewerbe-der-handwerksordnung-anlage-a/)
- [ZDH — Handwerksordnung Anlage B1 und B2](https://www.zdh.de/daten-und-fakten/handwerksordnung/gewerbe-anlage-b1-und-b2/)
- [Wikipedia — Handwerksordnung](https://de.wikipedia.org/wiki/Handwerksordnung)
- [Bundestag-Gutachten zur Einteilung der Gewerbe](https://www.bundestag.de/resource/blob/648060/eefd862705922241de27f833c15d9548/WD-5-047-19-pdf-data.pdf)
- [BBiG — Berufsbildungsgesetz](https://www.gesetze-im-internet.de/bbig_2005/BJNR093110005.html)
- [KMK — Rahmenlehrplaene und Ausbildungsordnungen](https://www.kmk.org/themen/berufliche-schulen/duale-berufsausbildung/rahmenlehrplaene-und-ausbildungsordnungen.html)
- [BIBB — Ausbildungsrahmenplan](https://www.bibb.de/de/141443.php)
- [DQR — Niveaus](https://www.dqr.de/dqr/de/der-dqr/dqr-niveaus/deutscher-qualifikationsrahmen-dqr-niveaus.html)
- [DQR — Tischler-Beispiel](https://www.dqr.de/dqr/shareddocs/qualifikationen-neu/de/Tischler-Tischlerin-vollqualifizierende-berufsfachschulische-Berufsausbildung-analog-BBiG-HwO.html)
- [DQR und EQR](https://www.dqr.de/dqr/de/der-dqr/dqr-und-eqr/deutscher-qualifikationsrahmen-dqr-und-eqr.html)
- [ESCO — Klassifikation](https://esco.ec.europa.eu/en/classification)
- [ESCO — Skills](https://esco.ec.europa.eu/en/classification/skill_main)
- [ESCO — Berufe](https://esco.ec.europa.eu/en/classification/occupation_main)
- [ESCO — Download + Lizenz](https://esco.ec.europa.eu/en/use-esco/download)
- [BERUFENET](https://web.arbeitsagentur.de/berufenet/)
- [BERUF AKTUELL 2025/26](https://www.arbeitsagentur.de/bildung/datei/beruf-aktuell-ausgabe-2025-26_ba023984.pdf)

**Gewerke-spezifisch**
- [Tischler-Ausbildungsordnung](https://www.tischler-schreiner.de/fileadmin/master/der_beruf/ausbildung/downloads/Ausbildungsordnung.pdf)
- [Schreiner.de — Ausbildungsrahmenplan](https://www.schreiner.de/fuer-schreiner/aus-und-weiterbildung/ausbildung/ausbildungsrahmenplan/)
- [Maurer-Lernfelder NRW](https://www.qua-lis.nrw.de/lernfelder-buendelungsfaecher-maurer-maurerin)
- [Rahmenlehrplan Hochbau](https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/RLP-Bau-Hochbau-mit-EL.pdf)
- [Elektroniker-Pruefungsvorbereitung](https://c.wgr.de/d/d40862e6d002f2e3916cab6e3ff81865995251501bb80087a60316ec1931435f.pdf/978-3-427-44010-9_07.pdf)
- [DIN EN ISO 9606-1 Schweisserpruefung — Poster](https://www.dvs-media.eu/media/pdf/schweisserpruefung-din-en-iso-9606-1-poster.pdf)
- [DIN EN ISO 9606-1 — DVS Home](https://www.dvs-home.de/fileadmin/Images/Landesverbaende/Suedwest-B/KS_Neckarsulm/Pruef-NormDINENISO9606-1.pdf)
- [Gaertner-Lehrplan NRW](https://www.berufsbildung.nrw.de/cms/upload/_lehrplaene/a/gaertner.pdf)
- [Schulgarten — Projekt-Uebersicht](https://www.backwinkel.de/blog/schulgarten/)
- [Schmiedekurse — Burgenlandschmiede](https://burgenlandschmiede.com/kurse/)
- [Schmiedekurse Schweiz](https://www.schmiede.ch/schmiede/Kurse.html)
- [Schmieden lernen — baubeaver](https://baubeaver.de/schmieden-lernen/)
- [Repair-Cafe-Netzwerk](https://www.reparatur-initiativen.de/orte)
- [Schueler-Reparaturwerkstatt — Das macht Schule](https://www.das-macht-schule.net/schueler-reparaturwerkstatt/)

**Cross-Skills + Sicherheit**
- [Schluesselqualifikation — Wikipedia](https://de.wikipedia.org/wiki/Schl%C3%BCsselqualifikation)
- [DGUV — Sicherheit Schulen](https://www.dguv.de/fb-bildungseinrichtungen/sachgebiete/schulen/orga/index.jsp)
- [DGUV Regel 102-601 — Schule](https://publikationen.dguv.de/widgets/pdf/download/article/3581)
- [JArbSchG — Jugendarbeitsschutzgesetz](https://www.gesetze-im-internet.de/jarbschg/BJNR009650976.html)
- [Vier-Stufen-Methode — Wikipedia](https://de.wikipedia.org/wiki/Vier-Stufen-Methode)

**Bestehende Tree-Plattformen + Programme**
- [SkillTree (NSA Open Source)](https://github.com/NationalSecurityAgency/skills-service)
- [Easy SkillTree](https://easyskilltree.com/about/)
- [Project SkillTree](https://www.projectskilltree.com/)
- [Duolingo — Achievements](https://duolingoguides.com/all-duolingo-achievements/)
- [Duolingo — Skill (Wiki)](https://duolingo.fandom.com/wiki/Skill)
- [MYSKILLS — Bertelsmann Stiftung](https://www.bertelsmann-stiftung.de/en/our-projects/identifying-occupational-skills/description)
- [Microcredentials vs Open Badges — Instructure](https://www.instructure.com/resources/blog/microcredentials-vs-open-badges-navigating-landscape-digital-learning-recognition)
- [HORNBACH macht Schule](https://hornbach-macht-schule.de/)
- [HORNBACH — Repair Cafe-Idee](https://www.hornbach.de/macher/die-repair-cafe-idee/)
