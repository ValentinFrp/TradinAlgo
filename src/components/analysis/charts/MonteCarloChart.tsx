import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartContainer } from './ChartContainer';

interface MonteCarloChartProps {
  data: {
    distributions: {
      finalBalances: number[];
      maxDrawdowns: number[];
      winRates: number[];
      sharpeRatios: number[];
    };
    confidenceIntervals: {
      finalBalance: { lower: number; upper: number };
      maxDrawdown: { lower: number; upper: number };
      winRate: { lower: number; upper: number };
      sharpeRatio: { lower: number; upper: number };
    };
  };
}

export function MonteCarloChart({ data }: MonteCarloChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 40, right: 60, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
      .domain([
        d3.min(data.distributions.finalBalances) || 0,
        d3.max(data.distributions.finalBalances) || 0
      ])
      .range([0, width]);

    const histogram = d3.histogram()
      .domain(x.domain())
      .thresholds(50);

    const bins = histogram(data.distributions.finalBalances);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 0])
      .range([height, 0]);

    // Draw histogram
    svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", d => x(d.x0 || 0))
      .attr("y", d => y(d.length))
      .attr("width", d => x(d.x1 || 0) - x(d.x0 || 0))
      .attr("height", d => height - y(d.length))
      .attr("fill", "#4f46e5")
      .attr("opacity", 0.6);

    // Draw confidence interval lines
    const drawConfidenceLine = (value: number, color: string, label: string) => {
      svg.append("line")
        .attr("x1", x(value))
        .attr("x2", x(value))
        .attr("y1", height)
        .attr("y2", 0)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

      svg.append("text")
        .attr("x", x(value))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .text(label);
    };

    drawConfidenceLine(data.confidenceIntervals.finalBalance.lower, "#ef4444", "Lower 95%");
    drawConfidenceLine(data.confidenceIntervals.finalBalance.upper, "#22c55e", "Upper 95%");

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Final Balance ($)");

    svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Frequency");

  }, [data]);

  return (
    <ChartContainer title="Monte Carlo Simulation Results">
      <div className="overflow-x-auto">
        <svg ref={svgRef}></svg>
      </div>
    </ChartContainer>
  );
}