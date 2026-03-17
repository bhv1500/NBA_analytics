import { useRecoilState } from "recoil";
import { selectedPlayerAtom } from "../../atoms/players";
import PlayerLineChart from "./PlayerLineChart";
import { useState } from "react";

type StatKey = "pts" | "ast" | "reb";

const STAT_TABS: { key: StatKey; label: string; color: string }[] = [
  { key: "pts", label: "Points", color: "text-indigo-400" },
  { key: "ast", label: "Assists", color: "text-amber-400" },
  { key: "reb", label: "Rebounds", color: "text-emerald-400" },
];

export default function PlayerDrawer() {
  const [player, setPlayer] = useRecoilState(selectedPlayerAtom);
  const [activeStat, setActiveStat] = useState<StatKey>("pts");

  if (!player) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-20"
        onClick={() => setPlayer(null)}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-96 bg-slate-900 border-l border-slate-800 z-30 overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              {player.first_name} {player.last_name}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {player.team?.full_name} · {player.position || "—"}
            </p>
          </div>
          <button
            onClick={() => setPlayer(null)}
            className="text-slate-500 hover:text-white transition-colors text-xl leading-none mt-1"
          >
            ✕
          </button>
        </div>

        {/* Stat Summary */}
        <div className="grid grid-cols-3 gap-px bg-slate-800 border-b border-slate-800">
          {[
            { label: "PPG", value: player.pts.toFixed(1), color: "text-indigo-400" },
            { label: "APG", value: player.ast.toFixed(1), color: "text-amber-400" },
            { label: "RPG", value: player.reb.toFixed(1), color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 p-4 text-center">
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>
                {s.value}
              </div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-px bg-slate-800 border-b border-slate-800">
          {[
            { label: "STL", value: player.stl.toFixed(1) },
            { label: "BLK", value: player.blk.toFixed(1) },
            { label: "GP", value: player.games_played },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 px-4 py-3 text-center">
              <div className="text-lg font-semibold text-slate-300 tabular-nums">
                {s.value}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="p-5 flex-1">
          <div className="flex gap-2 mb-4">
            {STAT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStat(tab.key)}
                className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                  activeStat === tab.key
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-transparent border-slate-700 text-slate-500 hover:border-slate-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <PlayerLineChart player={player} stat={activeStat} />
        </div>

        {/* Team badge */}
        <div className="px-5 pb-5">
          <div className="rounded-lg border border-slate-800 p-3 bg-slate-950 text-xs text-slate-500">
            <span className="text-slate-400 font-medium">{player.team?.conference} Conference</span>
            {" · "}
            {player.team?.division} Division
            {" · "}
            {player.team?.city}
          </div>
        </div>
      </aside>
    </>
  );
}
