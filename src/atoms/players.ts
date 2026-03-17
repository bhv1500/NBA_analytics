import { atom } from "recoil";
import type { Player, PlayerSeasonAvg } from "../api/balldontlie";

export interface EnrichedPlayer extends Player {
  pts: number;
  ast: number;
  reb: number;
  stl: number;
  blk: number;
  games_played: number;
}

// Raw data atoms — populated by hooks/queries
export const playersAtom = atom<Player[]>({
  key: "playersAtom",
  default: [],
});

export const seasonAveragesAtom = atom<PlayerSeasonAvg[]>({
  key: "seasonAveragesAtom",
  default: [],
});

// Merged atom — populated after web worker aggregation
export const enrichedPlayersAtom = atom<EnrichedPlayer[]>({
  key: "enrichedPlayersAtom",
  default: [],
});

export const selectedPlayerAtom = atom<EnrichedPlayer | null>({
  key: "selectedPlayerAtom",
  default: null,
});
