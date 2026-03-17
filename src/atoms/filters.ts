import { atom, selector } from "recoil";
import { enrichedPlayersAtom } from "./players";

export type Position = "G" | "F" | "C" | "G-F" | "F-C" | "F-G" | "C-F" | "";

export interface FilterState {
  search: string;
  positions: Position[];
  teams: string[]; // team abbreviations
  season: number;
  ptsRange: [number, number];
  astRange: [number, number];
  rebRange: [number, number];
}

export const filtersAtom = atom<FilterState>({
  key: "filtersAtom",
  default: {
    search: "",
    positions: [],
    teams: [],
    season: 2025,
    ptsRange: [0, 50],
    astRange: [0, 15],
    rebRange: [0, 20],
  },
});

export const filteredPlayersSelector = selector({
  key: "filteredPlayersSelector",
  get: ({ get }) => {
    const filters = get(filtersAtom);
    const players = get(enrichedPlayersAtom);

    return players.filter((p) => {
      const nameMatch =
        filters.search === "" ||
        `${p.first_name} ${p.last_name}`
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      const posMatch =
        filters.positions.length === 0 ||
        filters.positions.some((pos) => p.position?.startsWith(pos[0]));

      const teamMatch =
        filters.teams.length === 0 ||
        filters.teams.includes(p.team?.abbreviation ?? "");

      const ptsMatch =
        p.pts >= filters.ptsRange[0] && p.pts <= filters.ptsRange[1];

      const astMatch =
        p.ast >= filters.astRange[0] && p.ast <= filters.astRange[1];

      const rebMatch =
        p.reb >= filters.rebRange[0] && p.reb <= filters.rebRange[1];

      return nameMatch && posMatch && teamMatch && ptsMatch && astMatch && rebMatch;
    });
  },
});
