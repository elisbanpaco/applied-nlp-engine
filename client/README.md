# Applied NLP Engine — Frontend

![Next.js](https://img.shields.io/badge/Next.js-16.2-000?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Plotly](https://img.shields.io/badge/Plotly.js-3.5-3F4F75?logo=plotly)

Next.js 16 frontend for the Applied NLP Engine — text similarity comparison and interactive dendrogram visualization of Spanish text clusters.

## Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Futuristic system dashboard with engine status |
| Lexical Matcher | `/lexicalmatcher` | Compare two texts using Cosine or Jaccard similarity |
| Dendrogram | `/dendrograma` | Interactive hierarchical clustering visualization |

## Tech Stack

| Package | Purpose |
|---------|---------|
| Next.js 16 | React framework |
| React 19 | UI components |
| Plotly.js 3.5 | Interactive dendrogram rendering |
| Lucide React | Icon library |
| Tailwind CSS 4 | Utility-first styling |

## Quick Start

```bash
cd client
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the API must be running on `http://localhost:8000`.

## Environment Variables

Create a `.env` file in `client/`:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

## Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── layout.tsx               # Root layout (Navbar + Footer)
│   │   ├── globals.css              # Global Tailwind styles
│   │   ├── lexicalmatcher/page.tsx   # Text comparison tool
│   │   └── dendrograma/page.tsx     # Clustering visualization
│   └── components/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── public/
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

## License

MIT — See [../LICENSE](../LICENSE)
