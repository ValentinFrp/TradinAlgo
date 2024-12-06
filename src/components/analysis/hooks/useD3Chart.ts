import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export function useD3Chart(dimensions: ChartDimensions) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up base SVG with margins
    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
      .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
      .append("g")
      .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    return () => {
      d3.select(svgRef.current).selectAll("*").remove();
    };
  }, [dimensions]);

  return svgRef;
}