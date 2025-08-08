Italienisch Vokabeltrainer – Deploy & App Store Leitfaden
============================================================

Branding
--------
Palette übernommen:
- Sage (Primary): #84AB8A
- Teal (Accent):  #83C9C9
- Mint (Surface): #EBFFF5
- Ivory (BG):     #FFFFF2
- Ink (Text):     #222222

Funktionen
----------
- Richtungen: IT→DE und DE→IT
- Modi: Flashcards, Multiple Choice, Tippen (mit einfacher Korrektur)
- Einfaches Spaced Repetition, lokale Speicherung
- Optionale Audio-Ausgabe (Web Speech API)

Cyon Deployment (Web & PWA)
---------------------------
1) Alles in `public_html/` hochladen.
2) Domain öffnen – App läuft.
3) PWA: Auf iOS/Android „Zum Home-Bildschirm“ hinzufügen → Offline nutzbar.

App Store (iOS) – Weg über Capacitor
------------------------------------
1) Node.js installieren.
2) In einem neuen Ordner diese Dateien platzieren (als Web-Assets).
3) Capacitor initialisieren:
   npm install @capacitor/core @capacitor/cli
   npx cap init vokabeltrainer ch.deinedomain.vokabeltrainer --web-dir=.
   npm install @capacitor/ios && npx cap add ios
4) iOS öffnen: npx cap open ios
5) In Xcode: Bundle-ID, Icons, Signing einrichten.
6) Build → Archive → Upload to App Store Connect.
7) In App Store Connect Preis festlegen (Paid) oder IAPs konfigurieren.

Import-Formate
--------------
- JSON: siehe samples/vocab.json
- CSV:  Spalten: it,de,notes – siehe samples/vocab.csv
