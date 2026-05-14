# Skill-Tree-Neubau — Konzept

*Synthese der sechs Recherche-Berichte, Stand 2026-05-13.*
*Rohberichte in [recherche/](recherche/)*

---

## Kernsaetze

1. **Ein Tree, zwei Welten.** Handwerk und Schule teilen denselben Datensatz, aber mit zwei Sichten: Gewerk-Sicht (was kann ich) und Potenzialfeld-Sicht (worin steckt meine Begabung). Faceted Classification, kein Eltern-Konflikt.

2. **Skills sind verbunden, nicht aufgelistet.** Voraussetzungen als Kanten, drei Typen: Pflicht (gesetzlich/sicherheit), Empfohlen (didaktisch), Synergie (verstaerkt). Skill als Knoten, Gewerk als Cluster, Potenzialfeld als Faerbung, Mentoren-Pfad als parallele Linie.

3. **Begabung ist Verb, nicht Substantiv.** Der Tree zeigt was waechst, nicht was fehlt. Stufen-Sprache: gespuert, probiert, kann, kann lehren, meistert. Jede Stufe traegt einen Beleg — Foto, Geschichte, Werkstueck, Zeuge.

4. **Mentoren sind eigene Welt.** Parallele Skill-Achse fuer Lernbegleiter. Pfad: Lerner → Mit-Lerner → Quest-Geber → Mentor → Meister-Mentor. Anerkennung ueber drei Quellen: formale Pruefung (AEVO/Meister), Peer-Bestaetigung (Open Badges), gelebte Beziehung (Attestations von Lernenden).

5. **Datenfundament steht.** ESCO (13.890 Skills + 3.039 Berufe) + EU-Frameworks (DigComp, EntreComp, LifeComp, GreenComp). HwO Anlage A/B1/B2 (147 Gewerke) als Top-Sortierung. DQR 1-8 als vertikale Achse. Open Badges 3.0 + W3C Verifiable Credentials 2.0 als Attest-Format — direkter Anschluss an Antons WoT.

---

## I. Zwei Welten — eine Architektur

### Das Macher-Netzwerk und das Schul-Netzwerk teilen den Tree

| | Macher-Netzwerk | Schul-Netzwerk |
|---|---|---|
| **Sub-Spaces** | Macher Berlin, Macher Hamburg, Macher Kassel | Gesamtschule Gudensberg, Talentschule Bochum |
| **Zugang** | freiwillig, freizeitlich, Festival/Werkstatt | systemisch, schulisch, Klasse 7-10 |
| **Tree-Sicht (Default)** | Gewerke (Holz, Metall, Garten, Elektro, Bau, Reparatur) | Potenzialfelder (Raum/Bau, Stoff/Form, System/Logik, Welt/Wachstum, Mensch/Verbindung, Wort/Wirkung, Initiative/Werk) |
| **Tree-Sicht (alternativ)** | Potenzialfelder als Tags | Gewerke als Andock-Punkte |
| **Mentoren** | Handwerksmeister, Festival-Coaches, Hornbach-Workshop-Leiter | Lehrer, Lernbegleiter, Eltern-Mentoren, externe Profis |
| **Quests** | freiwillige Projekte, Werkstueck-orientiert | Schulische Lernsituationen + Praxistage |

**Ein Mensch traegt EIN Profil mit EINEM Tree.** Beide Netzwerke fuettern denselben Datensatz. Ein Kind aus der Gesamtschule Gudensberg bekommt Skill-XP fuer einen Werkstatttag bei Macher Kassel. Ein Macher Berlin-Erwachsener gibt Mentor-Quests an Schul-Gruppen — wachst dabei in seiner Mentor-Achse.

---

## II. Datenfundament

### ESCO als Skill-Steinbruch
13.890 Skills + 3.039 Berufe in 28 Sprachen, frei nutzbar. Linked Open Data mit RDF/TTL/CSV/JSON-LD. [tabiya-tech/tabiya-open-dataset](https://github.com/tabiya-tech/tabiya-open-dataset) liefert die saubere Variante zum Direkt-Import. Jeder unserer Skill-Knoten traegt eine ESCO-ID als `externalAnchor` — wir sind europaeisch anschlussfaehig.

### EU-Kompetenz-Frameworks als Begleitschiene
- **DigComp 2.2** (21 digitale Kompetenzen × 8 Niveaus) → System und Logik
- **EntreComp** (15 unternehmerische Kompetenzen × 8 Stufen × 442 Lernergebnisse) → Initiative und Werk
- **LifeComp** (9 personale/soziale Kompetenzen) → Mensch und Verbindung + Querschnitt
- **GreenComp** (12 Nachhaltigkeits-Kompetenzen) → Welt und Wachstum

### HwO + DQR als Strukturachsen
- **HwO Anlage A** (53 zulassungspflichtige Gewerke), **B1** (42 zulassungsfrei), **B2** (52 handwerksaehnlich) — 147 Gewerke als Top-Ebene
- **DQR 1-8** als vertikale Achse: Schnupperkurs 1-2, Lehre 3-4, Geselle 4, Meister 6

### Open Badges 3.0 + W3C VC 2.0 als Attest-Format
Skill-Attestierungen sind kryptographisch signierte Verifiable Credentials. Wallet-kompatibel zum EUDI-Wallet ab 2026. Direkt an Antons Ed25519 + DID andockbar. JSON-LD-Beispiel:

```json
{
  "@context": ["https://www.w3.org/ns/credentials/v2",
               "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"],
  "type": ["VerifiableCredential", "OpenBadgeCredential"],
  "issuer": { "id": "did:web:rln.network/macher-pfalz" },
  "credentialSubject": {
    "id": "did:key:z6Mki...",
    "achievement": {
      "id": "https://rln.network/skills/wig-schweissen",
      "name": "WIG-Schweissen (Geselle)",
      "alignment": [{
        "targetCode": "ESCO:S6.3.2",
        "targetFramework": "ESCO"
      }]
    }
  }
}
```

---

## III. Sieben Potenzialfelder

Aus Gardner (Multiple Intelligenzen), VIA-Charakterstaerken, OECD Learning Compass und Handwerks-Realitaet. Jedes Feld oeffnet eine Tuer in BEIDE Welten — Schule und Handwerk.

| Feld | Schul-Andock | Handwerks-Andock |
|---|---|---|
| **1. Raum und Bau** (raeumlich-konstruktiv) | Mathe (Geometrie, Volumen), Physik (Statik, Hebel), Architektur | Tischler, Maurer, Dachdecker, Zimmerer |
| **2. Stoff und Form** (gestalterisch-aesthetisch) | Kunst, Musik, Design | Maler, Goldschmied, Friseur, Konditor |
| **3. System und Logik** (analytisch-systemisch) | Physik, Informatik, Chemie | Elektrotechnik, Kfz-Mechatronik, Anlagenbau, IT |
| **4. Welt und Wachstum** (forschend-experimentell, oekologisch) | Biologie, Geographie, Naturwissenschaft | GaLaBau, Forstwirt, Landwirt, Imker, Saison-Koch |
| **5. Mensch und Verbindung** (sozial-koordinativ) | Sozialkunde, Religion, Ethik | Erzieher, Pflege, Mentoring, Lehre |
| **6. Wort und Wirkung** (kommunikativ-sprachlich) | Deutsch, Fremdsprachen, Rhetorik | Kundengespraech, Verkauf, Marketing, Journalismus |
| **7. Initiative und Werk** (unternehmerisch-handelnd) | Wirtschaft, Politik, Projektmanagement | Selbstaendigkeit, Manufaktur-Gruendung, Werkstatt-Fuehrung |

**Optional Querschnitt:** *Koerper und Bewegung* (koerperlich-kinaesthetisch) — laeuft durch alle Felder.

**Was wir bewusst weglassen:** kein Defizit-Feld, keine Noten-Achse, kein "Was fehlt dir noch zum Standard". Jedes Feld kennt nur Stufen nach oben.

---

## IV. Sechs Handwerks-Bereiche

Wir starten mit den sechs Gewerken, die Festival-affin, Hornbach-Sortiment-affin und kindgerecht sind:

| Gewerk | Anzahl Skills | Kinder-Eignung ab | Potenzialfelder |
|---|---|---|---|
| **Holzwerken** | 12 (Holz erkennen, Mass, Saegen, Bohren, Schleifen, Schrauben, Hobeln, Verleimen, Drechseln, Oberflaeche, Zinken) | 8 (Schleifen, Mass), 14 (Drechseln) | Raum/Bau + Stoff/Form |
| **Metall: Schweissen + Schmieden** | 11 + 11 (Feilen, Saegen, Bohren, Gewinde, Loeten, Autogen, Elektroden, MAG, WIG / Feuer, Gluehfarben, Hammer, Anspitzen, Breiten, Stauchen, Verdrehen, Biegen, Lochen, Spalten, Messer) | 8 (Hammer), 16 (Schweissen) | System/Logik + Raum/Bau |
| **Garten + Pflanzenbau** | 10 (Boden, Saen, Pikieren, Bestimmung, Giessen, Kompost, Hochbeet, Veredeln, Schnitt, Permakultur) | 6 (Boden, Saen, Giessen) | Welt/Wachstum |
| **Elektronik + Loeten** | 8 (Stromkreis, Schaltbild, Steckbrett, Loetkolben, Bauteile loeten, Multimeter, Arduino, 230V) | 8 (Stromkreis), 12 (Loeten), 18 (230V) | System/Logik |
| **Bauen + Renovieren** | 9 (Mauerstein, Moertel, Wand, Putz, Beton, Schalung, Bewehrung, Estrich, Daemmung) | 8 (Mauerstein), 12 (Mauern) | Raum/Bau |
| **Reparieren + Upcycling** | 9 (Fehler-Diagnose, Schrauben, Klebe loesen, Naehen, Reifen, Kabel, Holz-Bruch, Polster, Lack) | 8 (Schrauben), 10 (Naehen) | Querschnitt |

**Drei-Stufen-Granularitaet** pro Gewerk:
1. **Gewerk-Knoten** ("Holzwerken") — Sammelebene
2. **Technik-Knoten** ("Saegen") — Mittel-Ebene
3. **Werkzeug-Knoten** ("Stichsaege") — atomarer Skill mit Sicherheitsregeln, Voraussetzungen, Probe-Aufgabe, erkennbarem Ergebnis

---

## V. Wurzel-Skills (Cross-Skills)

Liegen unter ALLEN Gewerken. Aus allen Ausbildungsordnungen + DGUV.

1. **Mass nehmen** (Zollstock, Massband, Schieblehre, Wasserwaage, Laser)
2. **Skizze lesen + zeichnen** (Riss, Schnitt, Aufriss, Bemassung)
3. **Material erkennen** (Holz-Arten, Stahl-Sorten, Stein-Sorten, Kunststoffe)
4. **Arbeitsplatz organisieren** (Vorbereiten, Aufraeumen, Werkzeug-Pflege)
5. **Sicherheit** (PSA, gefaehrliche Stoffe, Sturzschutz, Augen-/Gehoerschutz)
6. **Erste Hilfe** (Schnitte, Verbrennungen, Splitter)
7. **Rechnen** (Volumen, Flaeche, Material-Bedarf, Mischungs-Verhaeltnisse)
8. **Werkzeug-Pflege** (Schaerfen, Oelen, Lagern)
9. **Teamwork + Auftrag annehmen** (Kunden-Gespraech, Uebergabe)

Diese Wurzeln sind die unteren Knoten — alles andere setzt darauf auf. Sie sind auch fuer Kinder gut zugaenglich (ausser Gas-Sicherheit oder Hochspannung).

---

## VI. Voraussetzungs-Logik

**Drei Kanten-Typen** zwischen Skill-Knoten:

1. **Pflicht** (rot, blockiert) — gesetzlich oder sicherheits-zwingend. Beispiel: Sicherheits-Einweisung vor Maschinen-Bedienung. Quelle: JArbSchG, DGUV-Regeln.
2. **Empfohlen** (gelb, durchlaessig) — didaktisch sinnvoll. Beispiel: Handsaege vor Tisch-Kreissaege. Quelle: Ausbildungsordnungen, IHK-Pruefungsverordnungen.
3. **Synergie** (gruen, optional) — verkuerzt + verstaerkt. Beispiel: Loeten vor Schaltung-Aufbauen.

**Alters-Tore** als zweite Schicht. Pro Skill ein Mindest-Alter, abgeleitet aus JArbSchG, DGUV-Schulregeln, Schmiede-/Werk-Kurs-Praxis. Kinder unter dem Alter sehen den Knoten — koennen den Quest aber nur mit Erwachsenen-Begleitung starten.

---

## VII. Mentoren-Achse (parallel)

20 atomare Mentor-Skills als eigene Achse neben den Fach-Skills. Im Profil als zweite Krone.

**Stufe 1 — Grundlagen:** Sicherheits-Einweisung, Vormachen, Erklaeren mit einfachen Worten, Aktives Zuhoeren, Wuerde-Wahrung

**Stufe 2 — Begleitung:** Beobachten, Offene Fragen stellen, Korrektur bei Gefahr, Loben am Verhalten, Reflexionsgespraech fuehren

**Stufe 3 — Vertiefung:** Lernsituation gestalten, Gruppendynamik halten, Fehlerkultur leben, Motivation halten, Konflikt moderieren

**Stufe 4 — Meisterschaft:** Co-Kreativitaet, Subjekt-Subjekt-Haltung, Andere Mentoren ausbilden, Quest-Design, Lebens-Begleitung

**Pfad mit vier Schwellen:**

| Schwelle | Voraussetzungen | Was darf man |
|---|---|---|
| **Mit-Lerner** | 3 abgeschlossene Quests im Gebiet | Anderen helfen die er selbst gemacht hat |
| **Quest-Geber** | 5 Mit-Lerner-Erfahrungen + 3 Peer-Attestations + Sicherheits-Einweisung Stufe 1 | Eigene Quests anbieten |
| **Mentor** | 20 Quest-Begleitungen + ueberwiegend positive Attestations | Offizielle Mentor-Rolle, Workshop-Leiter |
| **Meister-Mentor** | AEVO/Meisterbrief als Credential + 50 Mentor-Attestations + 3 Mentor-zu-Mentor-Attestations | Andere zu Mentoren ausbilden, Mentor-Quests entwerfen |

**Mentor-Quests zaehlen doppelt:** Quest-Geber bekommt Mentor-Skill-XP (Begleitung, Gruppendynamik, Reflexion), Lerner bekommt Fach-Skill-XP. Der Mentor waechst an seinem Lerner.

**Anti-Inflation:** Attestation-Gewichtung nach EigenTrust-Vorbild. Anomalie-Erkennung (Voting-Rings, ploetzliche Spruenge) markiert verdaechtige Muster fuer manuelle Pruefung.

---

## VIII. Datenstruktur (TypeScript-Skizze)

```typescript
export type BereichId =
  | 'raum-bau' | 'stoff-form' | 'system-logik'
  | 'welt-wachstum' | 'mensch-verbindung' | 'wort-wirkung' | 'initiative-werk'

export type Gewerk =
  | 'holz' | 'metall-schweissen' | 'metall-schmieden'
  | 'garten' | 'elektronik' | 'bau' | 'reparieren'

export type Tier = 'gespuert' | 'probiert' | 'kann' | 'kann-lehren' | 'meistert'

export type Altersfreigabe = 'alle' | 'ab6' | 'ab8' | 'ab10' | 'ab12' | 'ab14' | 'ab16' | 'volljaehrig'

export interface ExternalAnchor {
  framework: 'esco' | 'digcomp' | 'entrecomp' | 'lifecomp' | 'greencomp' | 'hwo'
  code: string
  level?: number  // bei DigComp/EntreComp: 1-8 oder DQR
}

export interface SkillEdge {
  to: SkillId
  typ: 'pflicht' | 'empfohlen' | 'synergie'
  begruendung?: string  // Quelle aus Ausbildungsordnung / DGUV / DIN
}

export interface AttestationRef {
  attesterDid: string         // WoT-Identitaet
  vcId: string                 // Verifiable Credential
  issuedAt: string
  achievementId?: string
  relation?: 'meister' | 'kollege' | 'kunde' | 'lehrling' | 'familie'
  visibility: 'oeffentlich' | 'kreis' | 'privat'
}

export interface Skill {
  id: SkillId
  name: string
  beschreibung?: string

  // Facetten — Mehrfach-Zugehoerigkeit (Faceted Classification)
  bereiche: BereichId[]              // ein Skill kann mehrere Bereiche speisen
  primaryBereich: BereichId          // visueller Heimat-Bereich
  gewerke: Gewerk[]                  // welche Gewerke nutzen ihn
  primaryGewerk?: Gewerk

  // Strukturachsen
  dqrNiveau: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  altersFreigabe: Altersfreigabe

  // Voraussetzungen
  voraussetzungen: SkillEdge[]

  // Externe Verankerung
  externalAnchors?: ExternalAnchor[]

  // Wie kann ich diesen Skill nachweisen?
  attestationModi: ('selbst' | 'peer' | 'meister' | 'pruefung' | 'werk')[]

  // Open-Badges-Template fuer Ausstellung
  badgeTemplate?: {
    name: string
    description: string
    criteria: string
    image?: string
  }

  // Probe-Aufgabe als konkretes Werk
  probeAufgabe?: {
    titel: string
    beschreibung: string
    zeitMinuten: number
    materialBenoetigt: string[]
  }
}

export interface LearningPath {
  id: string
  bereich: BereichId
  name: string                      // "Vom Bastler zum Geselle"
  beschreibung: string
  skillIds: SkillId[]               // geordnete Folge
  empfohleneDauerWochen?: number
  zielTier: Tier
}

export interface MentorSkill extends Skill {
  // Mentor-Skills haben gleiche Struktur wie Fach-Skills,
  // aber dedicated kategorisiert
  mentorStufe: 1 | 2 | 3 | 4  // Grundlagen / Begleitung / Vertiefung / Meisterschaft
}
```

---

## IX. Tree-Architektur

**Eine Datenbasis, zwei Sichten:**

1. **Gewerk-Sicht (Lane-Tree)** — Skills gruppiert nach `primaryGewerk`, geordnet nach DQR-Niveau. Pfad-Sicht fuer Anfaenger (Duolingo-Stil), DAG-Sicht fuer Power-User (Path-of-Exile-Stil).

2. **Potenzialfeld-Sicht (Sunburst)** — Skills gruppiert nach `bereiche` als Tags. Lebenskunst-Ansicht. Das, was wir Eltern, Lehrern und Schul-Pitch zeigen.

3. **Mentor-Achse** — eigene Sicht im Profil, neben den Fach-Skills.

**Technisch:**
- **Profil-Widget (P0, Festival 2026):** [beautiful-skill-tree](https://github.com/andrico1234/beautiful-skill-tree) — fertig, 20-100 Skills, Pitch-tauglich
- **Atlas-Sicht (P1+):** [Cytoscape.js](https://js.cytoscape.org/) — 500-5000 Knoten, DAG-faehig

---

## X. Bridge zur WoT-Identitaet

**Skill-XP entsteht durch:**
1. **Selbstdeklaration** (Stufe gespuert/probiert) — keine Attestation, nur eigener Eintrag
2. **Peer-Attestation** (Stufe kann) — andere Macher bestaetigen ("Ich habs gesehen, du kannst es")
3. **Meister-Attestation** (Stufe kann-lehren) — Mentor mit AEVO/Meisterbrief bestaetigt
4. **Pruefung/Wettbewerb** (Stufe meistert) — formaler Nachweis (Geselle, Meister, Jugend-forscht-Sieg)
5. **Werk-Beleg** (jede Stufe) — Foto, Video, Werkstueck-Eintrag mit Geo-Tag

Jede Attestation ist ein **W3C Verifiable Credential 2.0**, signiert mit der DID des Attestierenden ueber Antons Ed25519-Stack. Im Yjs-doc.attestations gespeichert. Anschluss an EUDI-Wallet ab 2026 selbstverstaendlich.

---

## XI. Implementierungs-Roadmap (4 Phasen)

### Phase 1 — Saeuberung (1-2 Pushes, jetzt)
Altes Skill-System aus `rln/src/modules/gamification/tree.ts` ausbauen. INNERE_BEREICHE / AEUSSERE_BEREICHE raus. Strukturen vorbereiten fuer neuen Datentyp.

### Phase 2 — Seed-Daten (1-2 Wochen)
ESCO-Subset (Crafts/Trades) ueber tabiya-Dataset importieren. JRC-Frameworks (DigComp/EntreComp/LifeComp/GreenComp) aus Excel mappen. HwO-Anlage-A/B1/B2 als Top-Sortierung. Erstes JSON in `rln/src/modules/gamification/seed-skills.json` mit ~200 Skills.

### Phase 3 — Tree-Komponente (2-3 Wochen)
Profil-Widget mit beautiful-skill-tree. Drei Tabs: Gewerke / Potenzialfelder / Mentor. Detail-Panel mit Voraussetzungen, Quests, Probe-Aufgabe, Attestation-Aufruf.

### Phase 4 — Attestation-Flow (2-3 Wochen)
Open-Badges-3.0-JSON-LD-Template. WoT-Signatur ueber Antons Routinen. UI: "Bestaetigen lassen" auf jedem Skill-Knoten. Eingang in Profil sichtbar machen.

---

## XII. Andock-Punkte

### Hornbach (Pitch-Linie)
- **Macher-Festival 2026** (6.-9.8., Ferropolis): Skill-Tree als Festival-Begleiter. Werkstatt → Skill-Knoten → mit-nach-Hause-Profil.
- **Hornbach macht Schule** (HMS): aus jedem Roadtrip-Tag bleibt eine Spur. Schueler nehmen Profil mit, Lehrer hat Klassenraum-Dashboard.
- **Baustoff Union** (Dr. Christian Hornbach): Profi-Anschluss-Quests. 39 Niederlassungen kennen 500-1000 Handwerksbetriebe namentlich — sofortiges Mentor-Netz.

### HWK + BMBF
- **BOP-Begleitwerkzeug** (Berufsorientierungsprogramm, bis 31.12.2026 verlaengert, 989 Mio. EUR kumulativ): Digitale Schicht ueber Werkstatttage.
- **Profil AC** (BW + RP): Andock-Punkt fuer Kompetenzfeststellung.

### Foerderlogik
- **Kultur macht stark 2023-2027** ueber DVV/talentCAMPus — RLN als Buendnis-Plattform fuer 3-Partner-Antraege.
- **Talentschulen NRW** (60 Schulen + 400 Lehrerstellen) als Modellregion.
- **Stiftungen:** Wuebben (Plattform-Affin), Vinci (Joblinge-Naehe), Karg (Begabungs-Fokus).

### Paedagogische Andocke
- **Schulen im Aufbruch** + **FREI DAY** — natuerlicher Inhalt fuer 4h/Woche.
- **Werkstattschule Jena**, **Produktives Lernen Berlin** als Praxisvorbilder.
- **Wuerdekompass** (aus dem Hueter-Universum) als bestehende Brueckenkontakt.

---

## XIII. Sprach-Linie (kein Hueter zitiert, Substanz traegt)

Der Tree spricht die Sprache von Potenzialentfaltung — ohne den Namen zu nennen:

- **"Begabung sichtbar machen"** statt "Defizit messen"
- **"Wie waechst du?"** statt "Wo stehst du?"
- **"Begleiter"** statt "Pruefer"
- **"Werk + Geschichte"** statt "Note + Standard"
- **"Gespuert / probiert / kann / kann lehren / meistert"** statt "ausreichend / gut / sehr gut"
- **"Beleg"** (Foto, Werkstueck, Zeuge) statt "Bewertung"
- **"Begeisterung als Schluessel"** als selbstverstaendliche Lern-Logik

Wenn Hueter den Tree sieht, erkennt er sich. Wenn ein Handwerksmeister ihn sieht, sieht er seine Werkstatt. Wenn ein Lehrer ihn sieht, sieht er seine Klasse. Wenn ein Kind ihn sieht, sieht es sich selbst.

---

## XIV. Naechste Entscheidungen (fuer Timo + Anton)

1. **Bereichs-Namen final?** Vorgeschlagen: Raum/Bau, Stoff/Form, System/Logik, Welt/Wachstum, Mensch/Verbindung, Wort/Wirkung, Initiative/Werk. Andere Worte moeglich.
2. **Sieben oder acht Felder?** Mit oder ohne Querschnitt "Koerper und Bewegung".
3. **Bundesland-Pilot?** Hornbach-Heimat Pfalz vs. politische Sichtbarkeit NRW (Talentschulen).
4. **Erstes Mentoren-Programm?** Festival-Coaches via Hornbach-Pfalz? Oder Lehrer aus FREI-DAY-Schulen?
5. **WoT-Anschluss-Reihenfolge:** Skill-Tree zuerst, dann VC-Attestation? Oder gleichzeitig?

---

*Rohberichte: `recherche/01-handwerks-skill-landschaft.md` bis `recherche/06-hornbach-baustoff-union.md`.*
*Hueter-Material: `Vision/projekte/wir-sind-wertvoll/gerald-huether-deep-dive.md`.*
*Hornbach-Konzern-Basis: `macher/docs/analyse/hornbach-konzern.md`.*
