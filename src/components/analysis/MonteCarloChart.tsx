import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

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
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
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

    // Draw confidence intervals
    const confidenceLine = svg.append("g");

    confidenceLine.append("line")
      .attr("x1", x(data.confidenceIntervals.finalBalance.lower))
      .attr("x2", x(data.confidenceIntervals.finalBalance.upper))
      .attr("y1", height + 20)
      .attr("y2", height + 20)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2);

    confidenceLine.append("line")
      .attr("x1", x(data.confidenceIntervals.finalBalance.lower))
      .attr("x2", x(data.confidenceIntervals.finalBalance.lower))
      .attr("y1", height + 15)
      .attr("y2", height + 25)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2);

    confidenceLine.append("line")
      .attr("x1", x(data.confidenceIntervals.finalBalance.upper))
      .attr("x2", x(data.confidenceIntervals.finalBalance.upper))
      .attr("y1", height + 15)
      .attr("y2", height + 25)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2);

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
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Monte Carlo Simulation Results
      </h3>
      <div className="overflow-x-auto">
        <svg ref={svgRef}></svg>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">95% Confidence Intervals</h4>
          <div className="space-y-2">
            <p className="text-sm">
              Final Balance: ${data.confidenceIntervals.finalBalance.lower.toFixed(2)} - 
              ${data.confidenceIntervals.finalBalance.upper.toFixed(2)}
            </p>
            <p className="text-sm">
              Max Drawdown: {(data.confidenceIntervals.maxDrawdown.lower * 100).toFixed(2)}% - 
              {(data.confidenceIntervals.maxDrawdown.upper * 100).toFixed(2)}%
            </p>
            <p className="text-sm">
              Win Rate: {(data.confidenceIntervals.winRate.lower * 100).toFixed(2)}% - 
              {(data.confidenceIntervals.winRate.upper * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}