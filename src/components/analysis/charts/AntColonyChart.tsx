import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartContainer } from './ChartContainer';
import { NoDataPlaceholder } from './NoDataPlaceholder';

interface AntColonyChartProps {
  pheromoneHistory?: Array<Record<string, number[]>>;
  fitnessHistory?: number[];
  parameterNames?: string[];
}

export function AntColonyChart({
  pheromoneHistory = [],
  fitnessHistory = [],
  parameterNames = []
}: AntColonyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // If no data, return early
    if (pheromoneHistory.length === 0 || fitnessHistory.length === 0) {
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
      .domain([0, fitnessHistory.length - 1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(fitnessHistory) || 1])
      .range([height, 0]);

    // Draw fitness line
    const line = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => y(d));

    svg.append("path")
      .datum(fitnessHistory)
      .attr("fill", "none")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Draw pheromone heatmaps
    const heatmapHeight = 50;
    const gap = 10;
    
    parameterNames.forEach((param, index) => {
      const yPos = height + 80 + (heatmapHeight + gap) * index;
      
      // Create heatmap scale
      const maxPheromone = d3.max(pheromoneHistory.flatMap(ph => ph[param] || [])) || 0;
      const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([0, maxPheromone]);

      // Draw heatmap
      pheromoneHistory.forEach((ph, timeIndex) => {
        const values = ph[param] || [];
        const cellWidth = width / values.length;
        
        values.forEach((value, valueIndex) => {
          svg.append("rect")
            .attr("x", x(timeIndex))
            .attr("y", yPos + (valueIndex * (heatmapHeight / values.length)))
            .attr("width", width / fitnessHistory.length)
            .attr("height", heatmapHeight / values.length)
            .attr("fill", colorScale(value));
        });
      });

      // Add parameter label
      svg.append("text")
        .attr("x", -10)
        .attr("y", yPos + heatmapHeight / 2)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "12px")
        .text(param);
    });

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

  }, [pheromoneHistory, fitnessHistory, parameterNames]);

  return (
    <ChartContainer title="Ant Colony Optimization Progress">
      {fitnessHistory.length > 0 ? (
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
            Best Fitness: {fitnessHistory.length > 0 
              ? Math.max(...fitnessHistory).toFixed(4)
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