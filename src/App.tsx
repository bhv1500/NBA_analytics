import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FilterPanel from "./components/FilterPanel/FilterPanel";
import ScatterPlot from "./components/ScatterPlot/ScatterPlot";
import GameFeed from "./components/GameFeed/GameFeed";
import PlayerDrawer from "./components/PlayerDrawer/PlayerDrawer";
import { usePlayerStats } from "./hooks/usePlayerStats";
import "./index.css";

const queryClient = new QueryClient();

function Dashboard() {
  const { isLoading } = usePlayerStats();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏀</span>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">NBA Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">2025–26 Season Dashboard</p>
          </div>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Loading stats…
          </div>
        )}
      </header>

      {/* Live Feed */}
      <GameFeed />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <FilterPanel />
        <main className="flex flex-col flex-1 p-4 overflow-hidden">
          <ScatterPlot />
        </main>
      </div>

      {/* Player Drawer */}
      <PlayerDrawer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <Dashboard />
      </RecoilRoot>
    </QueryClientProvider>
  );
}
