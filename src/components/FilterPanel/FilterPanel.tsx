import { useRecoilState, useRecoilValue } from "recoil";
import { filtersAtom, type Position } from "../../atoms/filters";
import { playersAtom } from "../../atoms/players";
import { useMemo } from "react";

const POSITIONS: Position[] = ["G", "F", "C"];
const SEASONS = [2025, 2024, 2023, 2022];

function RangeSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: [number, number];
  min: number;
  max: number;
  onChange: (v: [number, number]) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>
          {value[0].toFixed(1)} – {value[1].toFixed(1)}
        </span>
      </div>
      <div className="flex gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={0.5}
          value={value[0]}
          onChange={(e) => onChange([+e.target.value, value[1]])}
          className="w-full accent-indigo-500"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={0.5}
          value={value[1]}
          onChange={(e) => onChange([value[0], +e.target.value])}
          className="w-full accent-indigo-500"
        />
      </div>
    </div>
  );
}

export default function FilterPanel() {
  const [filters, setFilters] = useRecoilState(filtersAtom);
  const players = useRecoilValue(playersAtom);

  const teams = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of players) {
      if (p.team?.abbreviation) {
        seen.set(p.team.abbreviation, p.team.full_name);
      }
    }
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [players]);

  const togglePosition = (pos: Position) => {
    setFilters((f) => ({
      ...f,
      positions: f.positions.includes(pos)
        ? f.positions.filter((p) => p !== pos)
        : [...f.positions, pos],
    }));
  };

  const toggleTeam = (abbr: string) => {
    setFilters((f) => ({
      ...f,
      teams: f.teams.includes(abbr)
        ? f.teams.filter((t) => t !== abbr)
        : [...f.teams, abbr],
    }));
  };

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-white mb-4">Filters</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search player..."
        value={filters.search}
        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 mb-4 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      {/* Season */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 block mb-1">Season</label>
        <select
          value={filters.season}
          onChange={(e) =>
            setFilters((f) => ({ ...f, season: +e.target.value }))
          }
          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {SEASONS.map((s) => (
            <option key={s} value={s}>
              {s}–{s + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Position */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 block mb-2">Position</label>
        <div className="flex gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => togglePosition(pos)}
              className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                filters.positions.includes(pos)
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Ranges */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 block mb-2">Stat Ranges</label>
        <RangeSlider
          label="PPG"
          value={filters.ptsRange}
          min={0}
          max={50}
          onChange={(v) => setFilters((f) => ({ ...f, ptsRange: v }))}
        />
        <RangeSlider
          label="APG"
          value={filters.astRange}
          min={0}
          max={15}
          onChange={(v) => setFilters((f) => ({ ...f, astRange: v }))}
        />
        <RangeSlider
          label="RPG"
          value={filters.rebRange}
          min={0}
          max={20}
          onChange={(v) => setFilters((f) => ({ ...f, rebRange: v }))}
        />
      </div>

      {/* Teams */}
      <div>
        <label className="text-xs text-slate-400 block mb-2">
          Teams ({filters.teams.length === 0 ? "all" : filters.teams.length})
        </label>
        <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
          {teams.map(([abbr]) => (
            <button
              key={abbr}
              onClick={() => toggleTeam(abbr)}
              title={abbr}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                filters.teams.includes(abbr)
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500"
              }`}
            >
              {abbr}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() =>
          setFilters({
            search: "",
            positions: [],
            teams: [],
            season: 2024,
            ptsRange: [0, 50],
            astRange: [0, 15],
            rebRange: [0, 20],
          })
        }
        className="mt-6 w-full py-1.5 rounded text-xs text-slate-400 border border-slate-700 hover:border-red-500 hover:text-red-400 transition-colors"
      >
        Reset Filters
      </button>
    </aside>
  );
}
