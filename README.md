# KFZ Abaci Trading Portal

Ein modernes Fahrzeughandels-Portal mit Admin-Dashboard und Kundenbereich.

## 10-Tage Implementierungsplan

### Tag 3: Projektsetup & Grundstruktur
- [x] Projekt initialisieren mit Vite und React
- [x] Material-UI und notwendige Abhängigkeiten installieren
- [x] Grundlegende Projektstruktur erstellen
- [x] Routing-System implementieren
- [x] Basis-Layout mit Navigation erstellen

### Tag 4: Fahrzeugverwaltung (Admin)
- [x] Ordner Struktur verbesserung
- [x] Admin-Dashboard Grundstruktur
- [x] Fahrzeugverwaltungs-Interface
- [x] CRUD-Operationen für Fahrzeuge
- [x] Formular für Fahrzeugdetails
- [x] Bildupload-Funktionalität

### Tag 5: Fahrzeugliste & Detailansicht
- [x] Öffentliche Fahrzeugübersicht                   große probleme gehabt mit dem Importieren von funktionen, kein funktionstüchtiger code vorhanden. jedoch in die Branch Committet erstmal. Dennoch wurde das Problem vorhin gelöst, jedoch  zu spät geworden.
- [x] Filterung und Sortierung
- [x] Detailansicht für einzelne Fahrzeuge
- [x] Responsive Grid-Layout
- [x] Bildergalerie mit Vorschau

### Tag 6: Kundenanfragen
- [x] Anfrage-Formular für Fahrzeuge
- [x] Speichersystem für Anfragen
- [x] Admin-Interface für Anfragenverwaltung
- [x] Status-Management für Anfragen
- [] E-Mail-Benachrichtigungen AWS   Leiderkeine Zeit mehr.

### Tag 7: Benutzeroberfläche & Design
- [x] Einheitliches Designsystem
- [x] Responsive Navigation
- [x] Custom Theme-Konfiguration
- [x] Fehlermeldungen und Feedback

### Tag 8: Bildverwaltung & Optimierung
- [x] Bildupload-System
- [x] Bildkomprimierung
- [x] Lazy Loading für Bilder
- [x] Bildergalerie-Komponente
- [x] Fallback für fehlerhafte Bilder

### Tag 9: Admin-Dashboard Erweiterungen
- [x] Statistiken und Übersichten
- [x] Fortgeschrittene Filterfunktionen
- [ ] Bulk-Aktionen   Beim nächsten mal als erweiterung
- [x] Export-Funktionen


### Tag 10: Öffentlicher Bereich
- [x] Suchfunktion verbessern
- [x] Filter-System optimieren
- [x] Bug Fixxing Crud API operationen
- [x] Lösch funktion verbessert.
- [x] copy paste für Admin-Dashboard

### Tag 11: Datenverwaltung & Persistenz
- [x] LocalStorage Integration
- [x] Datenvalidierung
- [x] Error Handling
- [x] Datenmigration

### Tag 12: Testing & Optimierung
- [x] Unit Tests
- [x] Integration Tests
- [x] Performance-Optimierung
- [x] SEO-Optimierung
- [x] Dokumentation vervollständigen
- [x] DarkMode Addet!
- [x] Some Bug Fixing



## Projektstruktur

```
projekt/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── shared/
│   │   │   └── public/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
└── backend/
    ├── index.js
    └── package.json
```

## Hauptfunktionen

### Öffentlicher Bereich
- Fahrzeugübersicht mit Filterfunktionen
- Detaillierte Fahrzeugansichten
- Anfrage-System
- Responsive Design

### Admin-Bereich
- Fahrzeugverwaltung (CRUD)
- Anfragenverwaltung
- Bilderverwaltung
- Statistiken und Übersichten

## Technologien

- React mit Vite
- Material-UI
- React Router
- LocalStorage für Datenpersistenz
- Express.js Backend
- Multer für Bildupload

## Installation

1. Repository klonen:
```bash
git clone [repository-url]
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Entwicklungsserver starten:
```bash
node index.js
```

## Entwicklung

### Frontend starten:
```bash
cd frontend && npm run dev
```

### Backend starten:
```bash
cd backend && node index.js
```

## Deployment

1. Frontend build erstellen:
```bash
cd frontend && npm run build
```

2. Backend für Produktion vorbereiten:
```bash
cd backend && npm run build
```

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.
