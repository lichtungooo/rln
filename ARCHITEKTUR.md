# Architektur

Das Real Life Network ruht auf einer klaren, geschichteten Ordnung. Jede Schicht hat ihren Zweck. Jede Schicht spricht mit der nächsten über ein festes, einfaches Interface. So bleibt das Ganze verständlich und wächst in Ruhe.

---

## Das Bild

```text
┌───────────────────────────────────────────────────────────┐
│                         Module                           │
│  ┌─────────┐ ┌───────────┐ ┌─────┐ ┌──────────┐           │
│  │ Profile │ │ Dashboard │ │ Map │ │ Calendar │           │
│  └─────────┘ └───────────┘ └─────┘ └──────────┘           │
│  ┌──────────────┐ ┌─────┐ ┌───────────────┐ ┌───────────┐ │
│  │ Gamification │ │ Log │ │ Notifications │ │ Value ... │ │
│  └──────────────┘ └─────┘ └───────────────┘ └───────────┘ │
├───────────────────────────────────────────────────────────┤
│                        Toolkit                            │
│   UI-Komponenten, Hooks, geteilte Bausteine               │
├───────────────────────────────────────────────────────────┤
│                     DataInterface                         │
│   Der Vertrag zwischen Modulen und Daten                  │
├───────────────────────────────────────────────────────────┤
│                         Trust                             │
│   Identität, Verschlüsselung, Vertrauens-Netzwerk         │
└───────────────────────────────────────────────────────────┘
```

Jede Schicht ruht auf der darunter. Module wissen von Modulen, Toolkit, DataInterface und Trust — und lassen den Rest in Ruhe.

---

## Die Schichten im Einzelnen

### Trust — die Wurzel des Vertrauens

Der Trust trägt Identität und Verschlüsselung. Jeder Mensch besitzt seine Identität selbst:

- **Zwölf magische Worte** als Samen jeder Identität (BIP39-Mnemonic)
- **Ed25519** für Signaturen, **X25519** für sicheren Schlüsselaustausch
- **did:key** als dezentraler Bezeichner, offen und frei von zentralen Registern
- **AES-256-GCM** für die Verschlüsselung aller geteilten Inhalte
- **QR-Code-Verifikation** bei echter Begegnung — zwei Menschen, ein Moment, ein bestätigtes Band

Vertrauen wächst aus Begegnung, Begegnung aus gelebtem Leben. Der Trust hält diesen Schatz im Gerät jedes Menschen, geschützt und unter seiner Kontrolle.

### DataInterface — der gemeinsame Vertrag

Alle Module sprechen mit den Daten über ein einheitliches Interface. Sie wissen, *wie* sie fragen, und lassen offen, *wer* antwortet. So bleiben die Module frei von Annahmen über das Backend, und das Backend lässt sich austauschen, ohne die Module zu berühren.

Das zentrale Konzept ist einfach: **Alles ist ein Item.** Ein Item trägt eine Identität, einen Typ und seine Daten. Aus den Daten ergibt sich, in welchen Modulen das Item erscheint:

- Trägt es `start` und `end`, erscheint es im Kalender.
- Trägt es `location`, erscheint es auf der Karte.
- Trägt es `type: "profile"`, erscheint es als Profil.
- Trägt es `type: "quest"`, lebt es im Gamification-Stack.

Ein Item kann in mehreren Modulen gleichzeitig sichtbar sein. Das erspart Doppelarbeit und hält die Welt einfach.

### Toolkit — die geteilten Werkzeuge

Das Toolkit enthält die UI-Bausteine, die alle Module gemeinsam nutzen: Karten, Knöpfe, Kacheln, Formular-Elemente, Hooks für reaktive Daten. Es sorgt dafür, dass das Real Life Network überall gleich klingt, gleich aussieht und gleich anmutet.

### Module — die Türen ins Leben

Jedes Modul öffnet eine eigene Tür. Im Folgenden die sechs ersten Module mit ihrem Herz-Gedanken.

---

## Die Module

### Profile

Das Profil ist ein scrollbarer Raum, in dem jeder Mensch zeigt, was er mit anderen teilen möchte. Aus den anderen Modulen fließen Dinge hinein — erlebte Quests, gemeinsame Termine, Beiträge zur Gemeinschaft. Der Mensch wählt selbst, was sichtbar wird.

Das Profil beantwortet die Frage: *Was möchte ich von mir zeigen?*

### Dashboard

Das Dashboard ist der ruhige Absprungpunkt für jeden Menschen. Es trägt **Widgets** — klare Fenster in die anderen Module, die zeigen, was gerade wichtig ist. Je nach Space passt sich das Dashboard an: im Arbeits-Space stehen andere Widgets als im Spiel-Space. So findet jeder Mensch seinen persönlichen Blick.

### Map

Die Karte ist der räumliche Anker. Sie zeigt Menschen, Orte, Ereignisse und Gelegenheiten in der Umgebung. Jeder Mensch öffnet sie, wenn er den Raum sehen möchte — sie steht gleichrangig neben den anderen Modulen und drängt sich keinem auf.

### Calendar

Der Kalender hält die Zeit. Er zeigt Termine, Quests, Einladungen und ihre Rhythmen. Da eine Quest ein Item mit `start` und `end` ist, erscheint sie hier automatisch — ohne doppelten Weg, ohne zusätzliche Pflege.

### Gamification

Die Gamification ist die Reise, die aus dem Tun wird. Sie besteht aus sechs Bereichen des Fähigkeitenbaums (Körper, Geist, Seele, Bewusstsein, Soziales, Gemeinschaft), aus Attributen darunter, aus Erfahrungspunkten, aus Quests, Titeln, Items und dem Avatar. Jeder Mensch trägt seinen Charakter mit sich, wenn er zwischen Spaces wandert. Der Charakter lebt bei ihm, die Welten empfangen ihn.

### Log

Das Log ist der Spiegel. Jede Handlung, jede Quest, jeder Termin, jede Begegnung findet hier ihren Eintrag. Das Log dient der Reflexion — es zeigt dem Menschen, was er getan hat, wo er stand, wie er gewachsen ist. Aus dem Log fließen Fragmente in das Profil, wenn der Mensch sie mit anderen teilen möchte.

Das Log beantwortet die Frage: *Wer bin ich geworden?*

### Notifications

Die Notifications sind die Stimme zwischen den Menschen. Sie tragen, was andere mitteilen möchten: eine Einladung, eine Antwort, ein Gruß aus der Nähe, eine Quest, die ansteht. Jeder Mensch wählt selbst, welche Nachrichten ihn erreichen und in welcher Form.

### Value Creation

Die Wertschöpfung entsteht im Dreieck aus **Begabung, Bedürfnis und Begegnung**. Dieses Modul macht sichtbar, was gegeben und empfangen wird — jenseits der Zeitmessung, im Sinne echter, gelebter Kreisläufe.

---

## Der Fluss der Daten

```text
Mensch → Modul → Hook → DataInterface → Connector → Daten
                                              │
                                              ▼
                                           Trust-Schicht
                                        (verschlüsselt,
                                         im Gerät)
```

Ein Mensch handelt in einem Modul. Das Modul ruft einen Hook, der Hook spricht über das DataInterface mit einem Connector. Der Connector — im Fall des Trust-Bausteins — speichert die Daten verschlüsselt im Gerät des Menschen und teilt sie über sichere Kanäle mit den Menschen, denen vertraut wurde.

Nichts geht durch fremde Hände. Nichts landet in zentralen Registern. Der Mensch trägt seinen Schatz selbst.

---

## Erweiterung

Das Real Life Network wächst durch neue Module. Jedes neue Modul:

1. Spricht mit den Daten **ausschließlich** über das DataInterface.
2. Nutzt das Toolkit für seine Oberfläche.
3. Fügt sich in die bestehenden Module ein, ohne sie zu stören.
4. Trägt seine eigene klare Sprache — verständlich, positiv, einladend.

So entsteht im Lauf der Zeit ein reiches, zusammenhängendes Ganzes, das seinen eigenen Charakter trägt und doch mit einer Stimme spricht.

---

*Die Architektur des Real Life Network lebt aus Einfachheit und Klarheit. Jede Entscheidung darin dient dem Menschen, der das Werkzeug benutzt.*
