import * as d3 from 'd3';
import { ChartDataPoint } from '../types/chart';

export function createTooltip(container: HTMLElement) {
  return d3.select(container)
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
    .style("font-size", "12px")
    .style("pointer-events", "none");
}

export function updateTooltip(
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>,
  point: ChartDataPoint,
  event: MouseEvent,
  formatters?: {
    x?: (value: number) => string;
    y?: (value: number) => string;
  }
) {
  const formatX = formatters?.x || (x => x.toString());
  const formatY = formatters?.y || (y => y.toString());

  tooltip
    .style("visibility", "visible")
    .style("left", `${event.pageX + 10}px`)
    .style("top", `${event.pageY - 10}px`)
    .html(`
      <div class="font-medium">${formatX(point.x)}</div>
      <div class="text-gray-600">${formatY(point.y)}</div>
      ${point.label ? `<div class="text-xs text-gray-500">${point.label}</div>` : ''}
    `);
}

export function hideTooltip(
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>
) {
  tooltip.style("visibility", "hidden");
}