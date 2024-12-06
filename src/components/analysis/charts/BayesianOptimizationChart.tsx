import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartContainer } from './ChartContainer';
import { NoDataPlaceholder } from './NoDataPlaceholder';

interface BayesianOptimizationChartProps {
  acquisitionHistory: Array<{
    iteration: number;
    parameters: Record<string, number>;
    expectedImprovement: number;
    actualFitness: number;
  }>;
  uncertaintyHistory: Array<{
    parameters: Record<string, number>;
    mean: number;
    standardDeviation: number;
  }>;
}

export function BayesianOptimizationChart({ 
  acquisitionHistory = [], 
  uncertaintyHistory = [] 
}: BayesianOptimizationChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    if (acquisitionHistory.length === 0) {
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
      .domain([0, acquisitionHistory.length - 1])
      .range([0, width]);

    const yFitness = d3.scaleLinear()
      .domain([
        d3.min(acquisitionHistory, d => d.actualFitness) || 0,
        d3.max(acquisitionHistory, d => d.actualFitness) || 1
      ])
      .range([height, 0]);

    const yEI = d3.scaleLinear()
      .domain([0, d3.max(acquisitionHistory, d => d.expectedImprovement) || 1])
      .range([height, 0]);

    // Draw lines
    const fitnessLine = d3.line<typeof acquisitionHistory[0]>()
      .x(d => x(d.iteration))
      .y(d => yFitness(d.actualFitness));

    const eiLine = d3.line<typeof acquisitionHistory[0]>()
      .x(d => x(d.iteration))
      .y(d => yEI(d.expectedImprovement));

    svg.append("path")
      .datum(acquisitionHistory)
      .attr("fill", "none")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 2)
      .attr("d", fitnessLine);

    svg.append("path")
      .datum(acquisitionHistory)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4")
      .attr("d", eiLine);

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
      .call(d3.axisLeft(yFitness))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "#4f46e5")
      .attr("text-anchor", "middle")
      .text("Fitness");

    svg.append("g")
      .attr("transform", `translate(${width},0)`)
      .call(d3.axisRight(yEI))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 40)
      .attr("x", -height / 2)
      .attr("fill", "#ef4444")
      .attr("text-anchor", "middle")
      .text("Expected Improvement");

  }, [acquisitionHistory, uncertaintyHistory]);

  return (
    <ChartContainer title="Bayesian Optimization Progress">
      {acquisitionHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <svg ref={svgRef}></svg>
        </div>
      ) : (
        <NoDataPlaceholder />
      )}
    </ChartContainer>
  );
}