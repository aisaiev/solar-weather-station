# Solar Weather Station — Frontend

Angular 21 frontend for the Solar Weather Station project. Displays real-time and historical weather sensor data (temperature, humidity, pressure, etc.) via charts and tables.

## Tech Stack

- **Angular 21** — zoneless change detection, standalone components
- **ng2-charts** — sensor data visualization
- **Zard UI** — component library
- **Prettier** — code formatting

## Prerequisites

- Node.js 20+
- Backend API running at `http://localhost:3000/api` (see `../backend`)

## Development

```bash
npm install
npm start        # serves at http://localhost:4200
```

## Build

```bash
npm run build    # production build → dist/
```

## Test

```bash
npm test
```

## Format

```bash
npm run format          # write
npm run format:check    # check only
```

## Environment

Environment files live in `src/environments/`:

| File | Usage |
|---|---|
| `environment.ts` | Development (`ng serve`) |
| `environment.prod.ts` | Production (`ng build`) |

The `serverApiUrl` property controls the backend base URL.


