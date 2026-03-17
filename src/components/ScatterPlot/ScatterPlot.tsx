import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { filteredPlayersSelector } from "../../atoms/filters";
import { selectedPlayerAtom } from "../../atoms/players";
import type { EnrichedPlayer } from "../../atoms/players";

const MARGIN = { top: 20, right: 20, bottom: 50, left: 55 };

const CONFERENCE_COLORS: Record<string, string> = {
  East: "#6366f1",
  West: "#f59e0b",
};

export default function ScatterPlot() {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const players = useRecoilValue(filteredPlayersSelector);
  const setSelected = useSetRecoilState(selectedPlayerAtom);

  const containerRef = useRef<HTMLDivElement>(null);

  const dims = useMemo(() => {
    const w = containerRef.current?.clientWidth ?? 600;
    const h = containerRef.current?.clientHeight ?? 400;
    return {
      width: w - MARGIN.left - MARGIN.right,
      height: h - MARGIN.top - MARGIN.bottom,
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || players.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const totalW = svgRef.current.clientWidth || 600;
    const totalH = svgRef.current.clientHeight || 400;
    const width = totalW - MARGIN.left - MARGIN.right;
    const height = totalH - MARGIN.top - MARGIN.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(players, (d) => d.pts) ?? 40])
      .nice()
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(players, (d) => d.ast) ?? 12])
      .nice()
      .range([height, 0]);

    const r = d3
      .scaleSqrt()
      .domain([0, d3.max(players, (d) => d.reb) ?? 15])
      .range([3, 14]);

    // Grid
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#1e293b")
      .attr("stroke-dasharray", "3,3");
    g.select(".grid .domain").remove();

    g.append("g")
      .attr("class", "grid-x")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(-height)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#1e293b")
      .attr("stroke-dasharray", "3,3");
    g.select(".grid-x .domain").remove();

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(8))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px");

    g.append("g")
      .call(d3.axisLeft(y).ticks(6))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px");

    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("fill", "#94a3b8")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Points Per Game");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("fill", "#94a3b8")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Assists Per Game");

    // Tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Dots
    g.selectAll<SVGCircleElement, EnrichedPlayer>("circle")
      .data(players)
      .join("circle")
      .attr("cx", (d) => x(d.pts))
      .attr("cy", (d) => y(d.ast))
      .attr("r", (d) => r(d.reb))
      .attr("fill", (d) =>
        CONFERENCE_COLORS[d.team?.conference ?? ""] ?? "#64748b"
      )
      .attr("fill-opacity", 0.75)
      .attr("stroke", "#0f1117")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        d3.select(event.currentTarget)
          .raise()
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .attr("fill-opacity", 1);

        tooltip
          .style("opacity", 1)
          .html(
            `<div class="font-semibold">${d.first_name} ${d.last_name}</div>
             <div class="text-slate-400 text-xs">${d.team?.abbreviation} · ${d.position || "—"}</div>
             <div class="mt-1 text-xs">
               <span class="text-indigo-400">${d.pts.toFixed(1)} PPG</span> ·
               <span class="text-amber-400">${d.ast.toFixed(1)} APG</span> ·
               <span class="text-emerald-400">${d.reb.toFixed(1)} RPG</span>
             </div>`
          )
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY - 10}px`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY - 10}px`);
      })
      .on("mouseleave", (event) => {
        d3.select(event.currentTarget)
          .attr("stroke", "#0f1117")
          .attr("stroke-width", 1)
          .attr("fill-opacity", 0.75);
        tooltip.style("opacity", 0);
      })
      .on("click", (_event, d) => {
        setSelected(d);
      });

    // Legend
    const legend = g
      .append("g")
      .attr("transform", `translate(${width - 120}, 0)`);

    Object.entries(CONFERENCE_COLORS).forEach(([conf, color], i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 18})`);
      row.append("circle").attr("r", 5).attr("fill", color).attr("fill-opacity", 0.8);
      row
        .append("text")
        .attr("x", 10)
        .attr("y", 4)
        .attr("fill", "#94a3b8")
        .attr("font-size", "11px")
        .text(conf);
    });

    legend
      .append("text")
      .attr("y", 50)
      .attr("fill", "#64748b")
      .attr("font-size", "10px")
      .text("● size = RPG");
  }, [players, setSelected, dims]);

  return (
    <div className="relative flex-1 h-full min-h-0 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden" ref={containerRef}>
      <div className="absolute top-3 left-4 text-sm font-medium text-slate-300">
        Player Scatter — PPG vs APG
        <span className="ml-2 text-xs text-slate-500">({players.length} players)</span>
      </div>
      <svg ref={svgRef} width="100%" height="100%" className="mt-2" />
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute opacity-0 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 shadow-xl transition-opacity z-10"
      />
    </div>
  );
}
