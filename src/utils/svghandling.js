/**
 * svg-pan-zoom library
 *
 * https://github.com/ariutta/svg-pan-zoom
 */
import svgPanZoom from "svg-pan-zoom";

import Hammer from "hammerjs";

let panZoomInstance;
const panZoomOptions = {
  controlIconsEnabled: true,
  dblClickZoomEnabled: false,
  zoomScaleSensitivity: 0.5,
  minZoom: 0.0005,
  maxZoom: 100,
  customEventsHandler: {
    // Halt all touch events
    haltEventListeners: [
      "touchstart",
      "touchend",
      "touchmove",
      "touchleave",
      "touchcancel"
    ],

    // Init custom events handler
    init(options) {
      let instance = options.instance,
        initialScale = 1,
        pannedX = 0,
        pannedY = 0;
      // Init Hammer
      // Listen only for pointer and touch events
      this.hammer = Hammer(options.svgElement, {
        inputClass: Hammer.SUPPORT_POINTER_EVENTS
          ? Hammer.PointerEventInput
          : Hammer.TouchInput
      });
      // Enable pinch
      this.hammer.get("pinch").set({ enable: true });
      // Handle double tap
      this.hammer.on("doubletap", function() {
        instance.zoomIn();
      });
      // Handle pan
      this.hammer.on("panstart panmove", function(ev) {
        // On pan start reset panned variables
        if (ev.type === "panstart") {
          pannedX = 0;
          pannedY = 0;
        }
        // Pan only the difference
        instance.panBy({
          x: ev.deltaX - pannedX,
          y: ev.deltaY - pannedY
        });
        pannedX = ev.deltaX;
        pannedY = ev.deltaY;
      });
      // Handle pinch
      this.hammer.on("pinchstart pinchmove", function(ev) {
        // On pinch start remember initial zoom
        if (ev.type === "pinchstart") {
          initialScale = instance.getZoom();
          instance.zoomAtPoint(initialScale * ev.scale, {
            x: ev.center.x,
            y: ev.center.y
          });
        }
        instance.zoomAtPoint(initialScale * ev.scale, {
          x: ev.center.x,
          y: ev.center.y
        });
      });
      // Prevent moving the page on some devices when panning over SVG
      options.svgElement.addEventListener("touchmove", function(e) {
        e.preventDefault();
      });
    },

    // Destroy custom events handler
    destroy() {
      this.hammer.destroy();
    }
  }
};

export default class svghandling {
  init(svgElement) {
    this.svgElement = svgElement;
    this.setMapSize();
    this.resetZoom();
  }

  destroyZoomInstance() {
    if (panZoomInstance) {
      panZoomInstance.destroy();
      panZoomInstance = null;
    }
  }

  resetZoom() {
    this.destroyZoomInstance();
    panZoomInstance = svgPanZoom(this.svgElement, panZoomOptions);
  }

  setMapSize() {

    if (panZoomInstance) {
      panZoomInstance.resize();
    }
  }
}
