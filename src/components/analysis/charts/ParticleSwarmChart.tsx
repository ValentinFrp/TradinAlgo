import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartContainer } from './ChartContainer';
import { NoDataPlaceholder } from './NoDataPlaceholder';

interface ParticleSwarmChartProps {
  particleHistory?: Array<{
    position: Record<string, number>;
    velocity: Record<string, number>;
    fitness: number;
  }>;
  convergenceHistory?: number[];
  parameterNames?: string[];
}

export function ParticleSwarmChart({
  particleHistory = [],
  convergenceHistory = [],
  parameterNames = []
}: ParticleSwarmChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // If no data, show placeholder
    if (convergenceHistory.length === 0) {
      return;
    }

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
      .domain([0, convergenceHistory.length - 1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(convergenceHistory) || 1])
      .range([height, 0]);

    // Draw convergence line
    const line = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => y(d));

    svg.append("path")
      .datum(convergenceHistory)
      .attr("fill", "none")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Draw particles
    const particleRadius = 3;
    
    if (particleHistory.length > 0) {
      svg.selectAll(".particle")
        .data(particleHistory)
        .enter()
        .append("circle")
        .attr("class", "particle")
        .attr("cx", (_, i) => x(i))
        .attr("cy", d => y(d.fitness))
        .attr("r", particleRadius)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.5);
    }

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(10))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Iteration");

    svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Fitness");

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 120},20)`);

    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 2);

    legend.append("circle")
      .attr("cx", 10)
      .attr("cy", 20)
      .attr("r", particleRadius)
      .attr("fill", "#ef4444")
      .attr("opacity", 0.5);

    legend.append("text")
      .attr("x", 25)
      .attr("y", 4)
      .text("Best Fitness")
      .style("font-size", "12px");

    legend.append("text")
      .attr("x", 25)
      .attr("y", 24)
      .text("Particles")
      .style("font-size", "12px");

  }, [particleHistory, convergenceHistory, parameterNames]);

  return (
    <ChartContainer title="Particle Swarm Optimization Progress">
      {convergenceHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <svg ref={svgRef}></svg>
        </div>
      ) : (
        <NoDataPlaceholder />
      )}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Convergence</h4>
          <p className="text-sm">
            Final Best Fitness: {convergenceHistory.length > 0 
              ? convergenceHistory[convergenceHistory.length - 1].toFixed(4)
              : 'N/A'}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Parameters</h4>
          <p className="text-sm">
            Dimensions: {parameterNames.length}
          </p>
        </div>
      </div>
    </ChartContainer>
  );
}