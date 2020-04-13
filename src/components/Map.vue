<template>
  <div>
    <svg
      class="flex flex-grow bg-gray-200"
      id="svgMap"
      ref="svgMap"
      @mousemove="mapMouseMove"
    >
      <g class="svg-pan-zoom_viewport">
        <g
          pointer-events="fill"
          @mousedown="mouseBtn"
          @mouseup="mouseBtn"
          @mousemove="mouseBtn"
        >
          <polygon
            id="mapbounds"
            class="mapbounds"
            fill="transparent"
            :points="mapBoundsPoints"
          ></polygon>

          <image
            v-if="mapImageURL"
            :x="-editor.map.size / 2"
            :y="-editor.map.size / 2"
            :width="editor.map.size"
            :height="editor.map.size"
            :href="mapImageURL"
          />
        </g>

        <g class="targets">
          <text
            v-for="marker in editor.map.markers()"
            :key="marker.index"
            class="marker-label"
            text-anchor="middle"
            :x="marker.wpt.x"
            :y="marker.wpt.z - 4"
          >
            {{ marker.name }}
            <title v-if="marker.folder" v-text="marker.folder" />
          </text>
        </g>

        <g class="links">
          <defs>
            <marker
              id="arrow"
              markerWidth=".5"
              markerHeight=".5"
              refX="-.4"
              refY=".25"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L.5,.25 L0,.5" />
            </marker>
          </defs>
          <g v-for="(path, index) in drawnPaths" :key="index">
            <title v-if="debug">path # {{ index }}</title>
            <path
              class="link"
              :class="
                path.bidirectional
                  ? 'bidirectional'
                  : path.reverse
                  ? 'reverse'
                  : 'unidirectional'
              "
              :d="path.d"
            />
          </g>

          <g class="editing" v-if="pathsInEditing">
            <path
              v-for="path in pathsInEditing"
              :key="path.sindex"
              class="link"
              :d="path.d"
            />
          </g>
        </g>

        <g class="waypoints">
          <g
            v-for="waypoint in editor.map.waypointsArray()"
            :key="waypoint.index"
          >
            <title v-if="debug || waypoint.marker">
              {{
                waypoint.marker
                  ? (waypoint.marker.folder
                      ? waypoint.marker.folder + " / "
                      : "") +
                    waypoint.marker.name +
                    (debug ? " | " : "")
                  : ""
              }}
              {{
                debug
                  ? "wpt # " +
                    waypoint.index +
                    " @ " +
                    waypoint.x.toFixed(3) +
                    ", " +
                    waypoint.z.toFixed(3)
                  : ""
              }}
            </title>
            <circle
              @mousedown.self.stop="wptMouseBtn({ event: $event, waypoint })"
              @mouseup.self.stop="wptMouseBtn({ event: $event, waypoint })"
              @mousemove.self.stop="wptMouseBtn({ event: $event, waypoint })"
              :class="[
                waypoint.isNode() ? 'node' : 'waypoint',
                {
                  marker: waypoint.marker ? true : false,
                  draggable:
                    wptDragging &&
                    wptDragging.dragged &&
                    wptDragging.waypoint === waypoint
                }
              ]"
              :cx="waypoint.x"
              :cy="waypoint.z"
              :r="waypoint.marker ? 1.2 : waypoint.isNode() ? 0.5 : 0.3"
            />
          </g>
        </g>

        <g class="selection">
          <circle
            class="waypoint"
            v-for="(waypoint, selIndex) in selectedWpts"
            :key="waypoint.index"
            :class="{
              single:
                editor.selection.length === 1 && selectedWpts.length === 1,
              first: editor.selection.length > 1 && selIndex === 0,
              last:
                editor.selection.length > 1 &&
                selIndex === editor.selection.length - 1
            }"
            :cx="waypoint.x"
            :cy="waypoint.z"
            :r="waypoint.marker ? 1.4 : waypoint.isNode() ? 0.7 : 0.5"
          ></circle>
        </g>
      </g>
    </svg>

    <div class="absolute object-left-top text-xs">
      <div
        class="m-2 p-1 bg-gray-200 border border-gray-700 border-solid rounded"
      >
        <div v-if="debug">
          Segments drawn: {{ segments.reduced }} of {{ segments.total }}
        </div>

        <div v-if="mouse">
          Mouse @ {{ mouse.x.toFixed(3) }} {{ mouse.y.toFixed(3) }}
        </div>
        <div v-if="distance">Distance {{ distance.toFixed(3) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import svghandling from "../utils/svghandling";

export default {
  name: "Map",
  data: () => ({
    debug: true,
    leftclicking: null,
    mouse: null,
    wptDragging: false
  }),
  props: {
    editor: Object,
    mapImageURL: String
  },
  computed: {
    distance() {
      if (this.selectedWpts.length === 2) {
        return Math.sqrt(
          Math.pow(this.selectedWpts[0].x - this.selectedWpts[1].x, 2) +
            Math.pow(this.selectedWpts[0].z - this.selectedWpts[1].z, 2)
        );
      }
      return null;
    },
    selectedWpts() {
      return this.editor.selection
        .filter(item => item && item.waypoint)
        .map(({ waypoint }) => waypoint);
    },
    pathsInEditing() {
      if (
        this.wptDragging &&
        this.wptDragging.dragged &&
        this.wptDragging.waypoint
      ) {
        return this.wptDragging.waypoint.paths().map((p, index) => {
          return { index, d: this.pathDef(p.wpts) };
        });
      }
      return null;
    },
    drawnPaths() {
      return this.editor.map.paths.map(path => {
        let reduced = this.reducePath(path.wpts);

        let dpath = Object.fromEntries(Object.entries(path));

        delete dpath.wpts;

        dpath.segments = path.wpts.length - 1;
        dpath.reducedsegments = reduced.length - 1;
        dpath.d = this.pathDef(reduced);

        return dpath;
      });
    },
    segments() {
      return this.drawnPaths.reduce(
        (segments, path) => {
          return {
            total: segments.total + path.segments,
            reduced: segments.reduced + path.reducedsegments
          };
        },
        {
          total: 0,
          reduced: 0
        }
      );
    },
    mapBoundsPoints() {
      return [
        [-this.editor.map.size / 2, -this.editor.map.size / 2].join(","),
        [this.editor.map.size / 2, -this.editor.map.size / 2].join(","),
        [this.editor.map.size / 2, this.editor.map.size / 2].join(","),
        [-this.editor.map.size / 2, this.editor.map.size / 2].join(",")
      ].join(" ");
    }
  },
  methods: {
    pathDef(wpts) {
      return "M" + wpts.map(wpt => [wpt.x, wpt.z].join(",")).join(" L");
    },
    wptMouseBtn({ event, waypoint }) {
      if (event.button === 0) {
        if (event.type === "mousedown") {
          this.wptDragging = {
            waypoint,
            dragstart: { x: waypoint.x, z: waypoint.z },
            dragged: false
          };
        }

        if (this.wptDragging && event.type === "mouseup") {
          if (this.wptDragging.dragged) {
            this.$emit("wpt-dragged", this.wptDragging);
          } else {
            this.$emit("wpt-click", { event, waypoint });
          }
          this.wptDragging = false;
        }
      }
    },

    mouseEventMapCoords(event) {
      return this.handler.getSvgPoint({ x: event.offsetX, y: event.offsetY });
    },
    mapMouseMove(event) {
      this.mouse = this.mouseEventMapCoords(event);

      if (event.button === 0 && this.wptDragging) {
        this.wptDragging.dragged = true;
        this.wptDragging.waypoint.x = +this.mouse.x.toFixed(3);
        this.wptDragging.waypoint.z = +this.mouse.y.toFixed(3);
      }
    },
    mouseBtn(event) {
      if (event.button !== 0) {
        return;
      }

      if (event.type === "mousedown") {
        this.leftclicking = true;
      }

      if (event.type === "mousemove") {
        this.leftclicking = false;
      }

      if (event.type === "mouseup") {
        if (this.leftclicking) {
          this.$emit("map-click", {
            event,
            svgpoint: this.mouseEventMapCoords(event)
          });
        }
      }
    },
    windowResize() {
      this.handler.resize();
    },
    reducePath(wpts) {
      function dist(point, x, z) {
        var dx = x - point.x;
        var dz = z - point.z;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2));
      }

      function distToSegment(point, start, end) {
        var dx = end.x - start.x;
        var dz = end.z - start.z;
        var l2 = dx * dx + dz * dz;

        if (l2 == 0) return this.dist(point, start.x, start.z);

        var t = ((point.x - start.x) * dx + (point.z - start.z) * dz) / l2;
        t = Math.max(0, Math.min(1, t));

        return dist(point, start.x + t * dx, start.z + t * dz);
      }

      return wpts.reduce((reduced, wpt, wptIndex) => {
        if (wptIndex < 2) {
          reduced.push(wpt);
          return reduced;
        }

        if (
          distToSegment(wpts[wptIndex - 1], reduced.slice(-2, -1)[0], wpt) <
          0.15
        ) {
          reduced.splice(-1)[0];
        }

        reduced.push(wpt);

        return reduced;
      }, []);
    }
  },
  beforeDestroy: function() {
    window.removeEventListener("resize", this.windowResize);
  },

  mounted() {
    this.handler = new svghandling(this.$refs.svgMap);
    window.addEventListener("resize", this.windowResize);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mapbounds {
  fill: white;
  stroke: rgb(59, 56, 39);
  stroke-width: 2;
}

.draggable {
  cursor: move;
}

.waypoints .waypoint {
  fill: transparent;
  stroke: rgb(255, 101, 0);
  stroke-width: 0.1;
}

.waypoints .waypoint:hover {
  fill: rgb(78, 64, 63);
}

.waypoints .node {
  fill: rgb(255, 166, 0);
  stroke: rgb(255, 0, 0);
  stroke-width: 0.3;
}

.waypoints .node:hover {
  fill: rgb(78, 64, 63);
}

.waypoints .marker {
  fill: rgb(92, 60, 2);
  stroke: rgb(231, 152, 48);
  stroke-width: 0.4;
}

.marker-label {
  font-size: 10px;
  font-weight: 700;
  fill: rgb(92, 60, 2);
  stroke: rgb(255, 166, 0);
  stroke-width: 0.2;
}

.links .link {
  fill: none;
  stroke-linecap: round;
  stroke: rgb(75, 255, 75);
  stroke-opacity: 0.6;
  stroke-width: 1.5;
}

.links .editing .link {
  stroke: rgb(97, 68, 14);
  stroke-opacity: 1;
  stroke-width: 0.4;
}

.links .link:hover {
  stroke-opacity: 1;
}

.links .link.bidirectional {
  stroke: rgb(251, 47, 251);
}

.links .link.reverse {
  stroke: rgb(47, 251, 251);
}

.links .link.unidirectional,
.links .link.reverse {
  marker-mid: url(#arrow);
  marker-start: url(#arrow);
}

.links .links marker path {
  stroke-width: 0.1;
  stroke: rgb(6, 77, 6);
  fill: transparent;
}

.selection .waypoint {
  fill: none;
  stroke-width: 0.3;
  stroke: rgb(9, 0, 139);
}
.selection .waypoint.single {
  stroke: rgb(12, 255, 24);
}

.selection .waypoint.first {
  stroke: rgb(12, 255, 243);
}
.selection .waypoint.last {
  stroke: rgb(12, 109, 255);
}
</style>
