import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface SimulatedAnnealingChartProps {
  temperatureHistory: number[];
  fitnessHistory: number[];
}

export function SimulatedAnnealingChart({ 
  temperatureHistory, 
  fitnessHistory 
}: SimulatedAnnealingChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !temperatureHistory.length) return;

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
      .domain([0, temperatureHistory.length - 1])
      .range([0, width]);

    const yTemperature = d3.scaleLinear()
      .domain([0, d3.max(temperatureHistory) || 0])
      .range([height, 0]);

    const yFitness = d3.scaleLinear()
      .domain([d3.min(fitnessHistory) || 0, d3.max(fitnessHistory) || 0])
      .range([height, 0]);

    // Create line generators
    const temperatureLine = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => yTemperature(d));

    const fitnessLine = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => yFitness(d));

    // Draw temperature line
    svg.append("path")
      .datum(temperatureHistory)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 1.5)
      .attr("d", temperatureLine);

    // Draw fitness line
    svg.append("path")
      .datum(fitnessHistory)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 1.5)
      .attr("d", fitnessLine);

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
      .call(d3.axisLeft(yTemperature))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "#ef4444")
      .attr("text-anchor", "middle")
      .text("Temperature");

    svg.append("g")
      .attr("transform", `translate(${width},0)`)
      .call(d3.axisRight(yFitness))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 40)
      .attr("x", -height / 2)
      .attr("fill", "#22c55e")
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
      .attr("stroke", "#ef4444");

    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 20)
      .attr("y2", 20)
      .attr("stroke", "#22c55e");

    legend.append("text")
      .attr("x", 25)
      .attr("y", 4)
      .text("Temperature")
      .style("font-size", "12px");

    legend.append("text")
      .attr("x", 25)
      .attr("y", 24)
      .text("Fitness")
      .style("font-size", "12px");

  }, [temperatureHistory, fitnessHistory]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Simulated Annealing Progress
      </h3>
      <div className="overflow-x-auto">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}