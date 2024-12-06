import * as d3 from 'd3';

export function createLinearScale(
  domain: [number, number],
  range: [number, number]
) {
  return d3.scaleLinear()
    .domain(domain)
    .range(range);
}

export function createAxis(
  scale: d3.ScaleLinear<number, number>,
  orientation: 'left' | 'bottom',
  label?: string
) {
  const axis = orientation === 'left' ? d3.axisLeft(scale) : d3.axisBottom(scale);
  return { axis, label };
}

export function addAxisLabel(
  selection: d3.Selection<SVGGElement, unknown, null, undefined>,
  label: string,
  orientation: 'left' | 'bottom',
  offset: { x: number; y: number }
) {
  selection.append("text")
    .attr("transform", orientation === 'left' ? "rotate(-90)" : "")
    .attr("y", offset.y)
    .attr("x", offset.x)
    .attr("dy", orientation === 'left' ? "-3em" : "2em")
    .style("text-anchor", "middle")
    .text(label);
}

export function createLineGenerator(
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
) {
  return d3.line<number>()
    .x((_, i) => xScale(i))
    .y(d => yScale(d));
}