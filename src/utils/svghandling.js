/**
 * svg-pan-zoom library
 *
 * https://github.com/ariutta/svg-pan-zoom
 */
import svgPanZoom from "svg-pan-zoom";

const panZoomOptions = {
  controlIconsEnabled: true,
  dblClickZoomEnabled: false,
  zoomScaleSensitivity: 0.5,
  minZoom: 0.0005,
  maxZoom: 100,
};
let instance;
export default class svghandling {
  svgElement;
  constructor(svgElement) {
    this.svgElement = svgElement;
    if (instance) {
      instance.destroy();
    }
    instance = svgPanZoom(this.svgElement, panZoomOptions);
  }

  getSvgPoint({ x, y }) {
    var svgDropPoint = this.svgElement.createSVGPoint();

    svgDropPoint.x = x;
    svgDropPoint.y = y;

    return svgDropPoint.matrixTransform(
      document
        .getElementsByClassName("svg-pan-zoom_viewport")[0]
        .getCTM()
        .inverse()
    );
  }

  resize() {
    instance.resize();
  }
}
