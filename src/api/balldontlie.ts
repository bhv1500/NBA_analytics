import axios from "axios";

const BASE_URL = "https://api.balldontlie.io/v1";
const API_KEY = import.meta.env.VITE_BALLDONTLIE_KEY;

// Ball Don't Lie expects bracket notation: player_ids[]=1&player_ids[]=2
function serializeParams(params: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      val.forEach((v) => parts.push(`${key}[]=${encodeURIComponent(v)}`));
    } else {
      parts.push(`${key}=${encodeURIComponent(String(val))}`);
    }
  }
  return parts.join("&");
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: API_KEY },
  paramsSerializer: serializeParams,
});

export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  team: Team;
}

export interface Team {
  id: number;
  abbreviation: string;
  full_name: string;
  city: string;
  conference: string;
  division: string;
}

export interface PlayerSeasonAvg {
  player_id: number;
  season: number;
  pts: number;
  ast: number;
  reb: number;
  stl: number;
  blk: number;
  turnover: number;
  games_played: number;
  min: string;
}

export interface ApiGame {
  id: number;
  home_team: Team;
  visitor_team: Team;
  home_team_score: number;
  visitor_team_score: number;
  period: number;
  status: string;
  time: string;
  date: string;
}

export async function fetchPlayers(
  perPage = 100,
  cursor?: number
): Promise<{ data: Player[]; meta: { next_cursor?: number } }> {
  const res = await client.get("/players", {
    params: { per_page: perPage, cursor },
  });
  return res.data;
}

export async function fetchSeasonAverages(
  season: number,
  playerIds: number[]
): Promise<PlayerSeasonAvg[]> {
  if (playerIds.length === 0) return [];
  const res = await client.get("/season_averages", {
    params: { season, player_ids: playerIds },
  });
  return res.data.data;
}

export async function fetchTodaysGames(): Promise<ApiGame[]> {
  // Use local date, not UTC — avoids off-by-one at day boundaries
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const res = await client.get("/games", {
    params: { dates: [today], per_page: 15 },
  });
  return res.data.data as ApiGame[];
}
