import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { playersAtom, enrichedPlayersAtom } from "../atoms/players";
import { STATIC_PLAYERS } from "../data/playerStats";

export function usePlayerStats() {
  const setPlayers = useSetRecoilState(playersAtom);
  const setEnriched = useSetRecoilState(enrichedPlayersAtom);

  useEffect(() => {
    // season_averages endpoint requires a paid BallDontLie plan.
    // Using embedded 2024-25 season data — swap with API when upgrading.
    const players = STATIC_PLAYERS.map(({ pts: _p, ast: _a, reb: _r, stl: _s, blk: _b, games_played: _g, ...p }) => p);
    setPlayers(players as never);
    setEnriched(STATIC_PLAYERS);
  }, [setPlayers, setEnriched]);

  return { isLoading: false };
}
