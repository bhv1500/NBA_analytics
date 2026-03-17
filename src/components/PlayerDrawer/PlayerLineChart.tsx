import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { EnrichedPlayer } from "../../atoms/players";

// Simulated per-game history from season averages with slight noise
function generateGameHistory(player: EnrichedPlayer, numGames = 20) {
  return Array.from({ length: numGames }, (_, i) => ({
    game: i + 1,
    pts: Math.max(0, player.pts + (Math.random() - 0.5) * player.pts * 0.6),
    ast: Math.max(0, player.ast + (Math.random() - 0.5) * player.ast * 0.6),
    reb: Math.max(0, player.reb + (Math.random() - 0.5) * player.reb * 0.6),
  }));
}

const MARGIN = { top: 16, right: 16, bottom: 32, left: 36 };

interface Props {
  player: EnrichedPlayer;
  stat: "pts" | "ast" | "reb";
}

const STAT_COLORS: Record<string, string> = {
  pts: "#6366f1",
  ast: "#f59e0b",
  reb: "#10b981",
};

const STAT_LABELS: Record<string, string> = {
  pts: "Points",
  ast: "Assists",
  reb: "Rebounds",
};

export default function PlayerLineChart({ player, stat }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const data = useRef(generateGameHistory(player));

  useEffect(() => {
    data.current = generateGameHistory(player);
  }, [player]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const totalW = svgRef.current.clientWidth || 400;
    const totalH = svgRef.current.clientHeight || 200;
    const width = totalW - MARGIN.left - MARGIN.right;
    const height = totalH - MARGIN.top - MARGIN.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const games = data.current;
    const values = games.map((d) => d[stat]);

    const x = d3
      .scaleLinear()
      .domain([1, games.length])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(values) ?? 40])
      .nice()
      .range([height, 0]);

    const color = STAT_COLORS[stat];

    // Area fill
    const area = d3
      .area<(typeof games)[0]>()
      .x((d) => x(d.game))
      .y0(height)
      .y1((d) => y(d[stat]))
      .curve(d3.curveCatmullRom);

    g.append("defs")
      .append("linearGradient")
      .attr("id", "area-grad")
      .attr("x1", "0")
      .attr("x2", "0")
      .attr("y1", "0")
      .attr("y2", "1")
      .selectAll("stop")
      .data([
        { offset: "0%", opacity: 0.3 },
        { offset: "100%", opacity: 0 },
      ])
      .join("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", color)
      .attr("stop-opacity", (d) => d.opacity);

    g.append("path")
      .datum(games)
      .attr("d", area)
      .attr("fill", "url(#area-grad)");

    // Line
    const line = d3
      .line<(typeof games)[0]>()
      .x((d) => x(d.game))
      .y((d) => y(d[stat]))
      .curve(d3.curveCatmullRom);

    g.append("path")
      .datum(games)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("d", line);

    // Average line
    const avg = d3.mean(values) ?? 0;
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(avg))
      .attr("y2", y(avg))
      .attr("stroke", color)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.5);

    g.append("text")
      .attr("x", width)
      .attr("y", y(avg) - 4)
      .attr("text-anchor", "end")
      .attr("fill", color)
      .attr("font-size", "10px")
      .text(`avg ${avg.toFixed(1)}`);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat((d) => `G${d}`))
      .selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "10px");

    g.append("g")
      .call(d3.axisLeft(y).ticks(4))
      .selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "10px");

    // Remove domain lines
    g.selectAll(".domain").attr("stroke", "#1e293b");
    g.selectAll(".tick line").attr("stroke", "#1e293b");

    // Dots on last point
    const last = games[games.length - 1];
    g.append("circle")
      .attr("cx", x(last.game))
      .attr("cy", y(last[stat]))
      .attr("r", 4)
      .attr("fill", color)
      .attr("stroke", "#0f1117")
      .attr("stroke-width", 2);
  }, [player, stat]);

  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{STAT_LABELS[stat]} — Last 20 Games</div>
      <svg ref={svgRef} width="100%" height="160" />
    </div>
  );
}
