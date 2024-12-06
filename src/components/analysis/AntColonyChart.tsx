import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface AntColonyChartProps {
  pheromoneHistory: Array<Record<string, number[]>>;
  fitnessHistory: number[];
  parameterNames: string[];
}

export function AntColonyChart({
  pheromoneHistory,
  fitnessHistory,
  parameterNames
}: AntColonyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !pheromoneHistory.length) return;

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
      .domain([0, fitnessHistory.length - 1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(fitnessHistory) || 0])
      .range([height, 0]);

    // Create line generator
    const line = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => y(d));

    // Draw fitness line
    svg.append("path")
      .datum(fitnessHistory)
      .attr("fill", "none")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 2)
      .attr("d", line);

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
      .text("Best Fitness");

    // Add pheromone heatmaps
    const heatmapHeight = 50;
    const gap = 10;
    
    parameterNames.forEach((param, index) => {
      const yPos = height + 80 + (heatmapHeight + gap) * index;
      
      // Create heatmap scale
      const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([0, d3.max(pheromoneHistory.flatMap(ph => ph[param])) || 0]);

      // Draw heatmap
      svg.selectAll()
        .data(pheromoneHistory)
        .enter()
        .append("g")
        .each((d, i, nodes) => {
          const g = d3.select(nodes[i]);
          const cellWidth = width / d[param].length;
          
          d[param].forEach((value, j) => {
            g.append("rect")
              .attr("x", j * cellWidth)
              .attr("y", yPos)
              .attr("width", cellWidth)
              .attr("height", heatmapHeight)
              .attr("fill", colorScale(value));
          });
        });

      // Add parameter label
      svg.append("text")
        .attr("x", -50)
        .attr("y", yPos + heatmapHeight / 2)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .text(param);
    });

  }, [pheromoneHistory, fitnessHistory, parameterNames]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Ant Colony Optimization Progress
      </h3>
      <div className="overflow-x-auto">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}