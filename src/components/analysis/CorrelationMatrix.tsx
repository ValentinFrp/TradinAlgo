import React, { useEffect, useRef } from 'react';
import { Strategy, BacktestResult } from '../../types/trading';
import * as d3 from 'd3';

interface CorrelationMatrixProps {
  strategy: Strategy;
  results: Array<{
    parameters: Record<string, number>;
    result: BacktestResult;
  }>;
}

export function CorrelationMatrix({ strategy, results }: CorrelationMatrixProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || results.length === 0) return;

    // Calculate correlations between parameters and metrics
    const correlations = calculateCorrelations(strategy, results);
    
    // Set up dimensions
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();
    
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
    const x = d3.scaleBand()
      .range([0, width])
      .domain(correlations.parameters);

    const y = d3.scaleBand()
      .range([0, height])
      .domain(correlations.metrics);

    // Add cells
    svg.selectAll()
      .data(correlations.data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.parameter)!)
      .attr("y", d => y(d.metric)!)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", d => colorScale(d.correlation))
      .style("stroke", "#e5e7eb");

    // Add correlation values
    svg.selectAll()
      .data(correlations.data)
      .enter()
      .append("text")
      .attr("x", d => x(d.parameter)! + x.bandwidth() / 2)
      .attr("y", d => y(d.metric)! + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(d => d.correlation.toFixed(2));

    // Add x-axis labels
    svg.append("g")
      .style("font-size", "12px")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Add y-axis labels
    svg.append("g")
      .style("font-size", "12px")
      .call(d3.axisLeft(y));

  }, [strategy, results]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Parameter-Performance Correlation Matrix
      </h3>
      <div className="overflow-x-auto">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}

function calculateCorrelations(
  strategy: Strategy,
  results: Array<{
    parameters: Record<string, number>;
    result: BacktestResult;
  }>
) {
  const parameters = strategy.parameters.map(p => p.name);
  const metrics = ['winRate', 'profitFactor', 'maxDrawdown', 'sharpeRatio'];
  
  const correlationData = [];

  for (const param of parameters) {
    for (const metric of metrics) {
      const x = results.map(r => r.parameters[param]);
      const y = results.map(r => r.result[metric as keyof BacktestResult] as number);
      
      const correlation = calculateCorrelation(x, y);
      
      correlationData.push({
        parameter: param,
        metric: metric,
        correlation: correlation
      });
    }
  }

  return {
    parameters,
    metrics,
    data: correlationData
  };
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b) / n;
  const meanY = y.reduce((a, b) => a + b) / n;
  
  const covariance = x.reduce((sum, xi, i) => 
    sum + (xi - meanX) * (y[i] - meanY), 0) / n;
  
  const stdDevX = Math.sqrt(x.reduce((sum, xi) => 
    sum + Math.pow(xi - meanX, 2), 0) / n);
  
  const stdDevY = Math.sqrt(y.reduce((sum, yi) => 
    sum + Math.pow(yi - meanY, 2), 0) / n);
  
  return covariance / (stdDevX * stdDevY);
}