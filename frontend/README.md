# ElSikkerhed Frontend

Dette er frontend-applikationen til ElSikkerhed - et værktøj til elektrikere til at dokumentere og standardisere elsikkerhedstjek.

## Funktionaliteter

- Digital dokumentation af elsikkerhedstjek
- Håndtering af installationer og tests
- Visuelle dashboards for testresultater
- Brugervenlig interface designet til både desktop og mobile enheder

## Teknologier

- React 18
- TypeScript
- React Router v6
- Axios for API-kommunikation
- Tailwind CSS for styling

## Installation

1. Sørg for at have Node.js (v14 eller nyere) installeret
2. Klon dette repository
3. Installer afhængigheder:

```bash
npm install
```

4. Start udviklingsserveren:

```bash
npm start
```

Applikationen kører nu på http://localhost:3000.

## Forbindelse til API

Applikationen er konfigureret til at forbinde til ElSikkerhed API'en på `http://localhost:8000`. Hvis dit API kører på en anden adresse, skal du ændre `API_URL` konstanten i filer under `/src/api/`.

## Mappestruktur

- `/src/api/` - API-forbindelseslag
- `/src/components/` - Genbrugelige UI-komponenter
- `/src/contexts/` - React context for tilstandsstyring
- `/src/models/` - TypeScript interfaces og typer
- `/src/pages/` - Sidekomponenter
- `/src/utils/` - Hjælpefunktioner

## Produktion

Byg en produktionsversion med:

```bash
npm run build
```

Dette vil generere en optimeret build i `/build` mappen, der kan deployes til en web server.

## Licens

Dette projekt er licenseret under GNU General Public License v3.0.