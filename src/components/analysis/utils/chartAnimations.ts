import * as d3 from 'd3';
import { ANIMATION_DURATION } from '../constants/chartConfig';

export function animatePath(
  path: d3.Selection<SVGPathElement, unknown, null, undefined>,
  duration: number = ANIMATION_DURATION
) {
  const length = path.node()?.getTotalLength() || 0;
  
  path
    .attr("stroke-dasharray", `${length} ${length}`)
    .attr("stroke-dashoffset", length)
    .transition()
    .duration(duration)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);
}

export function animateAxis(
  axis: d3.Selection<SVGGElement, unknown, null, undefined>,
  duration: number = ANIMATION_DURATION
) {
  axis
    .style("opacity", 0)
    .transition()
    .duration(duration)
    .style("opacity", 1);
}

export function animatePoints(
  points: d3.Selection<SVGCircleElement, unknown, null, undefined>,
  duration: number = ANIMATION_DURATION
) {
  points
    .attr("r", 0)
    .transition()
    .duration(duration)
    .attr("r", 4);
}