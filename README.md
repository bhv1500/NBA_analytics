# NBA Analytics Dashboard

A real-time NBA analytics dashboard built as a portfolio project to demonstrate advanced React patterns, data visualization, and state management at scale.

---

## Features

### Live Game Feed
Fetches today's real NBA games from the Ball Don't Lie API and polls every 30 seconds for updated scores, quarter, and game time. Cards display the live score split bar, in-progress indicator, and final status.

### Interactive Player Scatter Plot
D3-powered scatter plot visualizing all active NBA players by Points Per Game (x-axis) vs Assists Per Game (y-axis). Bubble size encodes Rebounds Per Game. Points are colored by conference (East / West). Hover for a stat tooltip, click any player to open the detail drawer.

### Multi-Dimensional Filter Panel
Sidebar powered by Recoil atoms. Filters compose reactively via a Recoil selector — every change instantly re-renders the scatter plot without any prop drilling or context re-renders.

- **Search** — fuzzy name search
- **Season** — switch between NBA seasons
- **Position** — toggle Guard / Forward / Center
- **Team** — multi-select by team abbreviation
- **Stat sliders** — dual-handle range sliders for PPG, APG, and RPG

### Player Detail Drawer
Click any scatter plot dot to slide open a player detail panel showing:

- Season stat summary (PPG / APG / RPG / STL / BLK / GP)
- D3 line chart of per-game performance for the last 20 games
- Switchable stat view — Points, Assists, or Rebounds
- Team and division info

### Web Worker Aggregation
Raw player and season average data is merged off the main thread via a dedicated Web Worker, keeping the UI thread free during heavy data joins.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| State management | Recoil (atoms + selectors) |
| Data fetching | TanStack React Query |
| Visualization | D3 v7 |
| Styling | Tailwind CSS v3 |
| Off-thread compute | Web Workers (native) |
| Data source | Ball Don't Lie API v1 |

---

## Architecture Highlights

**Recoil atom graph**
```
filtersAtom ─────────────────────────┐
                                     ▼
enrichedPlayersAtom ──► filteredPlayersSelector ──► ScatterPlot
                                                 └──► FilterPanel (read counts)

selectedPlayerAtom ──► PlayerDrawer

gameFeedAtom ──► GameFeed
```

**Web Worker flow**
```
fetchPlayers()  ──┐
                  ├──► aggregation.worker.ts ──► enrichedPlayersAtom
fetchAverages() ──┘         (off main thread)
```

**Live feed polling**
```
useSimulatedFeed
  └── fetchTodaysGames() on mount + every 30s
        └── setFeed(games) ──► gameFeedAtom ──► GameFeed
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free API key from [balldontlie.io](https://www.balldontlie.io)

### Installation

```bash
git clone https://github.com/your-username/nba-analytics.git
cd nba-analytics
npm install
```

### Environment

Create a `.env` file in the project root:

```
VITE_BALLDONTLIE_KEY=your_api_key_here
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
```

---

## API Notes

The Ball Don't Lie free tier provides access to:
- `/games` — live and historical game scores
- `/players` — full player roster

The `season_averages` and `stats` endpoints require a paid plan. Player stat averages in this project use embedded 2024-25 season data. To enable live stat fetching, upgrade the API plan and restore the `fetchSeasonAverages` calls in `usePlayerStats.ts`.

---

## Project Structure

```
src/
  api/              # Ball Don't Lie API client
  atoms/            # Recoil atoms and derived selectors
  components/
    FilterPanel/    # Multi-dimensional filter sidebar
    ScatterPlot/    # D3 player scatter plot
    GameFeed/       # Live game score cards
    PlayerDrawer/   # Slide-out player detail + line chart
  data/             # Embedded 2024-25 season averages
  hooks/            # usePlayerStats, useSimulatedFeed
  workers/          # Web Worker for stat aggregation
```
