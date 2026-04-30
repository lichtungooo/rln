# RLN auf real-life.network deployen

Anleitung fuer Timo. Schritt-fuer-Schritt vom GitHub-Push zur Live-Domain.

---

## Voraussetzung

- DNS: real-life.network A-Record zeigt auf 85.214.196.122 (Strato-Server) — **erledigt**
- GitHub Actions hat das Image `ghcr.io/lichtungooo/rln:latest` gebaut — **muss laufen** (siehe nach Push)
- Du bist als `timo` auf dem Server eingeloggt: `ssh timo@h2980589.stratoserver.net`

---

## 1. Build-Status pruefen

Auf GitHub:

```
https://github.com/lichtungooo/rln/actions
```

Die letzte Action sollte gruen sein (Build + Push). Dauer: 2-5 Minuten.

Falls rot: ins Log schauen, Fehler verstehen, Issue im Repo. Fast immer einer der 6 Fallstricke aus `Real-Life-Forge/ERFAHRUNGEN.md` Erfahrung 16.

---

## 2. Container-Konfig auf dem Server anlegen

```bash
ssh timo@h2980589.stratoserver.net
mkdir -p ~/apps/rln
cd ~/apps/rln
nano docker-compose.yml
```

Inhalt:

```yaml
services:
  web:
    image: ghcr.io/lichtungooo/rln:latest
    container_name: rln-web-1
    restart: unless-stopped
    network_mode: bridge
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.rln.rule=Host(`real-life.network`)"
      - "traefik.http.routers.rln.entrypoints=websecure"
      - "traefik.http.routers.rln.tls.certresolver=letsencrypt"
      - "com.centurylinklabs.watchtower.enable=true"
```

Speichern (Ctrl-O, Enter, Ctrl-X).

---

## 3. Container starten

```bash
cd ~/apps/rln
docker compose pull
docker compose up -d
```

Erstes Pull dauert 30-60s. Dann `up -d` startet ihn als rln-web-1.

```bash
docker ps | grep rln
docker logs rln-web-1 --tail 20
```

Sollte `nginx running` zeigen.

---

## 4. Domain testen

```bash
curl -I https://real-life.network/
```

Sollte 200 OK + nginx zurueckgeben. Erste paar Anfragen koennen Lets-Encrypt-Bezogen 502 geben — Traefik provisioniert das Cert beim ersten Hit. Nach 30-60s ist alles gruen.

Browser: **https://real-life.network/** sollte die App laden.

---

## 5. macher-map.org als Redirect zu real-life.network/macher

Aktuell zeigt macher-map.org auf den `macher-map-web-1` Container. Plan: macher-map-web-1 wird zur reduzierten Landing-Seite, die auf real-life.network/macher umleitet.

**Option A: einfacher Redirect via Traefik** (sauberster Weg)

In `~/apps/macher-map/docker-compose.yml` die Labels erweitern:

```yaml
labels:
  - "traefik.enable=true"
  # Bestehende Route fuer die App entfernen oder kommentieren
  # - "traefik.http.routers.macher.rule=Host(`macher-map.org`)"

  # Neuer Redirect: macher-map.org/* -> real-life.network/macher/*
  - "traefik.http.routers.macher-redirect.rule=Host(`macher-map.org`)"
  - "traefik.http.routers.macher-redirect.entrypoints=websecure"
  - "traefik.http.routers.macher-redirect.tls.certresolver=letsencrypt"
  - "traefik.http.routers.macher-redirect.middlewares=macher-redirect-mw"
  - "traefik.http.middlewares.macher-redirect-mw.redirectregex.regex=^https?://macher-map.org/(.*)"
  - "traefik.http.middlewares.macher-redirect-mw.redirectregex.replacement=https://real-life.network/macher/$${1}"
  - "traefik.http.middlewares.macher-redirect-mw.redirectregex.permanent=true"
```

Container neu starten:

```bash
cd ~/apps/macher-map
docker compose up -d
```

Test:
```bash
curl -I https://macher-map.org/
# Sollte 301 -> https://real-life.network/macher/
```

**Option B: separate Landing-Container** — wenn du eine eigene Macher-Landing-Seite zeigen willst (statt sofortigem Redirect). Dafuer reduzieren wir den macher-map-Code-Stand zu einer Landing. Kommt in einem separaten Push (M7 in der Migration).

---

## 6. Alten rln-Container abschalten

Der alte rln (real-life-stack.de/app) ist obsolet — der macht das Panel-System.

```bash
cd ~/apps/rln-old   # oder wo der alte rln liegt — vermutlich ~/apps/rln aber mit anderem image
# pruefen welcher Container das war
docker ps | grep -i rln
```

Wenn ein alter `rln-rln-1` Container laeuft mit `real-life-stack.de/app`-Routing, dann:

```bash
docker stop <alter-container>
docker rm <alter-container>
# entsprechende docker-compose.yml updaten oder loeschen
```

Watchtower wird ihn nicht zurueckholen weil er gestoppt + entfernt ist.

---

## 7. Verifikation

| URL | Erwartung |
|-----|-----------|
| https://real-life.network/ | RLN-App (aktuell: Macher-Space-Default) |
| https://macher-map.org/ | 301-Redirect auf real-life.network/macher |
| https://lichtung.ooo/ | unveraendert (eigener Container) |

---

## Bekannte Fallstricke

1. **DNS-Propagation** — falls real-life.network neu eingerichtet ist, kann es ein paar Minuten bis Stunden dauern bis DNS weltweit aktualisiert ist. Test: `nslookup real-life.network` sollte 85.214.196.122 zeigen.

2. **Lets-Encrypt-Limits** — wenn Traefik das Cert nicht provisioniert, kann es am Rate-Limit liegen (5 Certs/Woche/Domain). Im Traefik-Log nach "rateLimited" schauen.

3. **Watchtower** — pollt alle 30s. Wenn ein Push live gehen soll: warten bis ghcr.io das neue Image hat, dann max. 30s warten.

4. **Multi-Repo-Build** — der CI-Build holt drei Repos parallel (rln, real-life-stack, web-of-trust). Wenn einer der Forks Probleme hat, schlaegt der Build fehl. Logs in der GitHub Action zeigen welcher.

---

## Was als Naechstes (nach Domain-Live)

- M7: macher-map.org Landing-Page (aktueller App-Stand wird zur einfachen Landing reduziert)
- URL-Slug-Routing: real-life.network/macher/karte (statt /app/spaces/<uuid>/...)
- RLN-Landing-Page nach WoT-Vorbild auf /

Siehe `project_rln_domain_umzug.md` in der Memory.
