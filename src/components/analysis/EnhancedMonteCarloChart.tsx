import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface EnhancedMonteCarloChartProps {
  data: {
    distributions: {
      finalBalances: number[];
      maxDrawdowns: number[];
      winRates: number[];
      sharpeRatios: number[];
    };
    valueAtRisk: {
      var95: number;
      var99: number;
      cvar95: number;
      cvar99: number;
    };
    streakAnalysis: {
      maxWinStreak: number;
      maxLossStreak: number;
      avgWinStreak: number;
      avgLossStreak: number;
    };
    recoveryAnalysis: {
      averageRecoveryTime: number;
      maxRecoveryTime: number;
      recoveryProbability: number;
    };
  };
}

export function EnhancedMonteCarloChart({ data }: EnhancedMonteCarloChartProps) {
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

    // Create scales for histogram
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

    // Draw VaR lines
    const drawVaRLine = (value: number, color: string, label: string) => {
      const xPos = x((1 - value) * d3.mean(data.distributions.finalBalances)!);
      
      svg.append("line")
        .attr("x1", xPos)
        .attr("x2", xPos)
        .attr("y1", height)
        .attr("y2", 0)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

      svg.append("text")
        .attr("x", xPos)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .text(label);
    };

    drawVaRLine(data.valueAtRisk.var95, "#ef4444", "VaR 95%");
    drawVaRLine(data.valueAtRisk.var99, "#f97316", "VaR 99%");

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
        Enhanced Monte Carlo Analysis
      </h3>
      <div className="overflow-x-auto">
        <svg ref={svgRef}></svg>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Value at Risk</h4>
          <div className="space-y-1">
            <p className="text-sm">VaR (95%): {(data.valueAtRisk.var95 * 100).toFixed(2)}%</p>
            <p className="text-sm">CVaR (95%): {(data.valueAtRisk.cvar95 * 100).toFixed(2)}%</p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Streak Analysis</h4>
          <div className="space-y-1">
            <p className="text-sm">Max Win Streak: {data.streakAnalysis.maxWinStreak}</p>
            <p className="text-sm">Avg Win Streak: {data.streakAnalysis.avgWinStreak.toFixed(1)}</p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recovery Analysis</h4>
          <div className="space-y-1">
            <p className="text-sm">Avg Recovery: {data.recoveryAnalysis.averageRecoveryTime.toFixed(1)} trades</p>
            <p className="text-sm">Recovery Prob: {(data.recoveryAnalysis.recoveryProbability * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}