import { useRecoilValue } from "recoil";
import { gameFeedAtom, type GameUpdate } from "../../atoms/gameFeed";
import { useSimulatedFeed } from "../../hooks/useSimulatedFeed";

function statusLabel(game: GameUpdate): { text: string; live: boolean } {
  const s = game.status?.toLowerCase() ?? "";
  if (s === "final") return { text: "Final", live: false };
  if (s.includes("half")) return { text: "Halftime", live: true };
  if (game.quarter > 0 && game.timeLeft) {
    return { text: `Q${game.quarter} · ${game.timeLeft}`, live: true };
  }
  if (game.quarter > 0) return { text: `Q${game.quarter}`, live: true };
  return { text: game.status || "Scheduled", live: false };
}

function GameCard({ game }: { game: GameUpdate }) {
  const isHome = game.homeScore > game.awayScore;
  const tied = game.homeScore === game.awayScore;
  const { text, live } = statusLabel(game);
  const total = game.homeScore + game.awayScore;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 min-w-[168px] shrink-0">
      <div className="flex items-center justify-center gap-1.5 mb-2">
        {live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
        <span className="text-xs text-slate-500">{text}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-center flex-1">
          <div className="text-xs text-slate-400 mb-0.5">{game.awayTeam}</div>
          <div className={`text-2xl font-bold tabular-nums ${!isHome && !tied ? "text-white" : "text-slate-500"}`}>
            {game.awayScore}
          </div>
        </div>

        <div className="text-slate-700 text-xs font-medium">@</div>

        <div className="text-center flex-1">
          <div className="text-xs text-slate-400 mb-0.5">{game.homeTeam}</div>
          <div className={`text-2xl font-bold tabular-nums ${isHome && !tied ? "text-white" : "text-slate-500"}`}>
            {game.homeScore}
          </div>
        </div>
      </div>

      <div className="mt-2.5 h-0.5 w-full bg-slate-800 rounded overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${total > 0 ? (game.homeScore / total) * 100 : 50}%` }}
        />
      </div>
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="text-xs text-slate-600 py-1">No games scheduled for today.</div>
  );
}

export default function GameFeed() {
  useSimulatedFeed();
  const games = useRecoilValue(gameFeedAtom);

  return (
    <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Today's Games
        </span>
        <span className="text-xs text-slate-600">· polls every 30s</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {games.length === 0 ? <EmptyFeed /> : games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
