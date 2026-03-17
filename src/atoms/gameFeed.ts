import { atom } from "recoil";

export interface GameUpdate {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeLeft: string;
  status: string; // e.g. "Final", "2nd Qtr", "7:32"
  timestamp: number;
}

export const gameFeedAtom = atom<GameUpdate[]>({
  key: "gameFeedAtom",
  default: [],
});
