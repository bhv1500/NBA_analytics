import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { gameFeedAtom, type GameUpdate } from "../atoms/gameFeed";
import { fetchTodaysGames, type ApiGame } from "../api/balldontlie";

const POLL_INTERVAL_MS = 30_000;

function apiGameToUpdate(game: ApiGame): GameUpdate {
  return {
    id: String(game.id),
    homeTeam: game.home_team.abbreviation,
    awayTeam: game.visitor_team.abbreviation,
    homeScore: game.home_team_score,
    awayScore: game.visitor_team_score,
    quarter: game.period || 0,
    timeLeft: game.time || "",
    status: game.status,
    timestamp: Date.now(),
  };
}

export function useSimulatedFeed() {
  const setFeed = useSetRecoilState(gameFeedAtom);

  useEffect(() => {
    async function fetchAndSet() {
      try {
        const games = await fetchTodaysGames();
        if (games.length > 0) {
          setFeed(games.map(apiGameToUpdate));
        }
      } catch (err) {
        console.error("Failed to fetch live games:", err);
      }
    }

    fetchAndSet();
    const interval = setInterval(fetchAndSet, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [setFeed]);
}
