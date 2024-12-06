import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Strategy } from '../../../types/trading';
import { ChartContainer } from './ChartContainer';

interface CorrelationMatrixProps {
  strategy: Strategy;
  results: Array<{
    parameter: string;
    metrics: {
      winRate: number;
      profitFactor: number;
      maxDrawdown: number;
      sharpeRatio: number;
    };
  }>;
}

export function CorrelationMatrix({ strategy, results }: CorrelationMatrixProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !results.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 40, right: 40, bottom: 40, left: 120 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const cellSize = Math.min(width, height) / 4;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create color scale
    const colorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(["#ef4444", "#ffffff", "#22c55e"]);

    // Create scales
    const parameters = results.map(r => r.parameter);
    const metrics = ['winRate', 'profitFactor', 'maxDrawdown', 'sharpeRatio'];

    const x = d3.scaleBand()
      .range([0, width])
      .domain(metrics)
      .padding(0.05);

    const y = d3.scaleBand()
      .range([0, height])
      .domain(parameters)
      .padding(0.05);

    // Add cells
    results.forEach(result => {
      metrics.forEach(metric => {
        svg.append("rect")
          .attr("x", x(metric)!)
          .attr("y", y(result.parameter)!)
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth())
          .style("fill", colorScale(result.metrics[metric as keyof typeof result.metrics]))
          .style("stroke", "#e5e7eb");

        // Add correlation value
        svg.append("text")
          .attr("x", x(metric)! + x.bandwidth() / 2)
          .attr("y", y(result.parameter)! + y.bandwidth() / 2)
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .text(result.metrics[metric as keyof typeof result.metrics].toFixed(2));
      });
    });

    // Add axes
    svg.append("g")
      .style("font-size", "12px")
      .call(d3.axisLeft(y));

    svg.append("g")
      .style("font-size", "12px")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

  }, [results]);

  return (
    <ChartContainer title="Parameter-Performance Correlation Matrix">
      <div className="overflow-x-auto">
        <svg ref={svgRef}></svg>
      </div>
    </ChartContainer>
  );
}