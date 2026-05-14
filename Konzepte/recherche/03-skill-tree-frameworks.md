# Skill-Tree-Frameworks — Recherche-Bericht

*Recherche-Agent 3 von 6 · Eingang: 2026-05-13*

## Kernerkenntnisse

- **Open Badges 3.0 ist seit Mai 2025 W3C-Recommendation-konform.** Direkt VCDM-2.0-basiert — derselbe kryptographische Stack wie Antons Web of Trust. Skills-mit-Attestierung sind ein geloestes Problem mit JSON-LD-Schemas.
- **Die EU liefert vier fertige Kompetenz-Frameworks zum Import.** DigComp (21/8), EntreComp (15/8/442 Lernergebnisse), LifeComp (9), GreenComp (12). Alle frei beim JRC abrufbar.
- **ESCO 13.890 Skills + 3000 Berufe** in RDF/TTL/CSV/JSON-LD ueber Open-Source-API. Wir muessen nichts erfinden, nur einsammeln.
- **CASE + CTDL sind die Datenaustausch-Standards** fuer Kompetenz-Frameworks und Credentials.
- **Fertige React-Skill-Tree-Komponenten taugen nur fuer P0.** Fuer das echte RLN-Volumen (500-5000 Knoten) bleibt Cytoscape.js.
- **Duolingo, Khan, Path of Exile zeigen das gleiche Pattern:** Anfaenger bekommen einen gefuehrten Pfad, Fortgeschrittene die volle Karte.

## 1. EdTech-Lerngraphen

**Khan Academy Knowledge Map** bis 2017 — Sternenkarte mit Skills + Mastery-Markierungen auf Google-Maps-Renderer. Abgeschaltet weil sie Anfaenger ueberforderte. Heute: Mastery-System mit 4 Niveaus (Familiar/Practiced/Level1/Level2/Mastered). Lehre: Mastery-Niveaus mit klaren Schwellen schaffen Vertrauen.

**Brilliant.org** — Learning Paths mit weichen Voraussetzungen. System schaetzt Vorwissen ab und empfiehlt Einstiegspunkt. Erwachsene Lern-UX: Soft-Prerequisites + Einschaetzung.

**Duolingo** hat Nov 2022 Skill-Tree abgeschafft. Begruendung: zu viel Wahl, Anfaenger ueberfordert. Lehre: Fuer breite Zielgruppe gewinnt gefuehrter Pfad. Tree als optionale Ansicht.

**freeCodeCamp** — Zertifizierungen mit 5 Pflichtprojekten + Quiz. Curriculum als Markdown im offenen Repo. Sie arbeiten 2025/26 an JSON-LD-Strukturdaten — Anschluss zu Open Badges 3.0.

## 2. Skill-Trees in Spielen

**Path of Exile** — Daten offen als JSON. Cluster-Notable-Pattern: kleine Knoten gruppieren sich um benannte Hauptknoten. Lane-Tree (Civilization, Stellaris, roadmap.sh) fuer Desktop-Ansicht. Tier-Gates (Lehrling/Geselle/Meister mit Mindest-Skill-Zahl). Build-Sharing als Kultur — "mein Weg zum Imker" als teilbarer URL/QR-Code.

## 3. Open-Standards

**W3C Verifiable Credentials Data Model 2.0** (W3C-Recommendation Mai 2025) — Issuer/Holder/Verifier. JSON-LD mit kryptographischer Signatur. Antons Ed25519 + DID passt direkt.

**Open Badges 3.0** (1EdTech) — direkt VCDM-2.0-konform. Defined Achievement Claim + Skill Claim. JSON-LD-Beispiel:

```json
{
  "@context": ["https://www.w3.org/ns/credentials/v2",
               "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"],
  "type": ["VerifiableCredential", "OpenBadgeCredential"],
  "issuer": { "id": "did:web:rln.network/macher-space" },
  "credentialSubject": {
    "id": "did:key:z6Mki...",
    "achievement": {
      "id": "https://rln.network/skills/imkern",
      "name": "Imkern (Geselle)",
      "alignment": [{ "targetCode": "0721.0", "targetFramework": "ESCO" }]
    }
  }
}
```

EUDI-Wallet ab 2026 EU-pflichtig — unsere Skills sind dort einlesbar.

**CASE** (1EdTech) — REST-API-Standard fuer Kompetenz-Frameworks. Andock-Punkt fuer Hochschul-/Hornbach-Curricula.

**CTDL** (Credential Engine) — Linked-Data-Sprache fuer Credentials. 50000+ im US Credential Registry.

**ESCO** — 13890 Skills + 3000 Berufe in 28 Sprachen, frei nutzbar. [tabiya-tech/tabiya-open-dataset](https://github.com/tabiya-tech/tabiya-open-dataset) als ESCO-Import-Pfad.

## 4. EU-Frameworks als Daten

| Framework | Bereiche | Kompetenzen | Niveaus |
|-----------|----------|-------------|---------|
| DigComp 2.2 | 5 | 21 | 8 |
| EntreComp | 3 | 15 | 8 + 442 Lernergebnisse |
| LifeComp | 3 | 9 | konzeptionell |
| GreenComp | 4 | 12 | konzeptionell |

Format: PDF + Excel (nicht sauberes JSON). Offizielle DigComp ↔ ESCO Mapping-Datei als Excel maschinenlesbar. Pragmatischer Pfad: Excel einsaugen mit xlsx-Library, in JSON uebertragen, ueber escoCode verankern.

## 5. Open-Source-Implementierungen

| Library | Status | Beste Nutzung |
|---------|--------|---------------|
| [beautiful-skill-tree](https://github.com/andrico1234/beautiful-skill-tree) | reif | Pitch-Demo, 20-100 Skills |
| [react-d3-tree](https://github.com/bkrem/react-d3-tree) | sehr aktiv | hierarchische Baeume |
| [react-tree-graph](https://github.com/jpb12/react-tree-graph) | reif | Org-Chart-Stil |
| [interactive-skill-tree-builder](https://github.com/hazu100/interactive-skill-tree-builder) | jung | Editor-Skelett |
| Cytoscape.js | reif | Atlas-Ansicht 500-5000 Knoten |

**Daten-orientiert:** poe-tool-dev/passive-skill-tree-json (PoE-Daten), tabiya-tech/tabiya-open-dataset (ESCO sauber), w3c/vc-data-model (VC-Schemas).

## 6. Datenstruktur-Empfehlung

```typescript
export interface ExternalAnchor {
  framework: 'esco' | 'digcomp' | 'entrecomp' | 'lifecomp' | 'greencomp' | 'onet' | 'wikidata'
  code: string
  level?: number
}

export interface AttestationRef {
  attesterDid: string
  vcId: string
  issuedAt: string
  achievementId?: string
  relation?: 'meister' | 'kollege' | 'kunde' | 'lehrling' | 'familie'
  visibility: 'oeffentlich' | 'kreis' | 'privat'
}

export interface Skill {
  id: string
  name: string
  bereiche: BereichId[]              // Mehrfach-Zugehoerigkeit
  primaryBereich: BereichId          // visueller Heimat-Bereich
  potenzialfelder: string[]          // zweite Facette als Tags
  externalAnchors?: ExternalAnchor[]
  altersFreigabe?: 'alle' | 'ab6' | 'ab12' | 'ab16' | 'volljaehrig'
  attestationModi?: ('selbst' | 'peer' | 'meister' | 'pruefung' | 'werk')[]
  badgeTemplate?: { name: string; description: string; criteria: string; image?: string }
}

export interface LearningPath {
  id: string
  bereich: BereichId
  name: string
  skillIds: SkillId[]
  empfohleneDauerWochen?: number
  zielTier: Tier
}
```

**Gewerke + Potenzialfelder ohne zwei Trees:** Mehrfach-Zugehoerigkeit (Faceted Classification). Ein Skill wie "Imkern" hat `bereiche: ['handwerk', 'bewusstsein', 'gemeinschaft']`, `primaryBereich: 'handwerk'`, `potenzialfelder: ['naturverbindung', 'achtsamkeit', 'selbstversorgung']`. EIN Datensatz, ZWEI Sichten (Gewerk-Lane-Tree + Potenzialfeld-Sunburst).

## 7. Empfehlung

**Daten:** ESCO + JRC-Frameworks. tabiya-Dataset als ESCO-Import. JRC-Excel-Mappings fuer DigComp/EntreComp/LifeComp/GreenComp. Daraus Macher-Map-Seed mit 150-300 Skills, jeder mit externalAnchors.

**Identitaet:** WoT + VC 2.0 + Open Badges 3.0. Skill-Attestierungen als kryptographisch signierte VCs, wallet-kompatibel zum EUDI-Wallet.

**Visuell:** Hybrid. Profil-Widget mit beautiful-skill-tree fuer Pitch-Demo (P0, Festival August 2026). Atlas-Ansicht mit Cytoscape.js fuer P1+. Pfad-Sicht als Default fuer Anfaenger, DAG-Sicht als Power-User.

**Konkrete naechste Schritte:**
1. Seed-Daten generieren (1-2 Tage): tabiya-ESCO clonen, Crafts/Trades extrahieren, JRC-Excels einlesen, in JSON-Schema mappen
2. Bereichs-Mapping festlegen (Timo/Eli/Anton)
3. VC-Template bauen (1 Tag): Open-Badges-3.0-JSON-LD an WoT-Signatur
4. Profil-Widget mit beautiful-skill-tree (2-3 Tage)
5. Forschungsskizze Macher-Atlas mit Cytoscape.js (Phase P1)

## Quellen

- [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- [Open Badges 3.0 Spec](https://www.imsglobal.org/spec/ob/v3p0)
- [CASE @ 1EdTech](https://www.1edtech.org/standards/case)
- [CTDL @ Credential Engine](https://credentialengine.org/credential-transparency/ctdl/)
- [ESCO Download](https://esco.ec.europa.eu/en/use-esco/download)
- [tabiya-tech/tabiya-open-dataset](https://github.com/tabiya-tech/tabiya-open-dataset)
- [DigComp 2.2 JRC](https://publications.jrc.ec.europa.eu/repository/handle/JRC128415)
- [EntreComp JRC](https://joint-research-centre.ec.europa.eu/entrecomp-entrepreneurship-competence-framework_en)
- [LifeComp JRC](https://joint-research-centre.ec.europa.eu/lifecomp_en)
- [GreenComp JRC](https://joint-research-centre.ec.europa.eu/greencomp-european-sustainability-competence-framework_en)
- [beautiful-skill-tree](https://github.com/andrico1234/beautiful-skill-tree)
- [Cytoscape.js](https://js.cytoscape.org/)
- [Path of Exile Skill Tree Data](https://github.com/poe-tool-dev/passive-skill-tree-json)
- [Khan Academy Mastery](https://support.khanacademy.org/hc/en-us/articles/5548760867853)
- [Duolingo Path Design](https://blog.duolingo.com/new-duolingo-home-screen-design/)
