import type { Player, PlayerSeasonAvg } from "../api/balldontlie";
import type { EnrichedPlayer } from "../atoms/players";

export interface WorkerInput {
  players: Player[];
  averages: PlayerSeasonAvg[];
}

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { players, averages } = e.data;

  const avgMap = new Map<number, PlayerSeasonAvg>();
  for (const avg of averages) {
    avgMap.set(avg.player_id, avg);
  }

  const enriched: EnrichedPlayer[] = players
    .map((player) => {
      const avg = avgMap.get(player.id);
      return {
        ...player,
        pts: avg?.pts ?? 0,
        ast: avg?.ast ?? 0,
        reb: avg?.reb ?? 0,
        stl: avg?.stl ?? 0,
        blk: avg?.blk ?? 0,
        games_played: avg?.games_played ?? 0,
      };
    })
    .filter((p) => p.games_played > 0); // only players with actual data

  self.postMessage(enriched);
};
