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

        <g class="branches">
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
          <g v-for="(branch, index) in drawnBranches" :key="index">
            <title v-if="debug">branch # {{ index }}</title>
            <path
              @click="
                $emit('branch-click', { event: $event, branch: branch.original })
              "
              class="branch"
              :class="
                branch.bidirectional
                  ? 'bidirectional'
                  : branch.reverse
                  ? 'reverse'
                  : 'unidirectional'
              "
              :d="branch.d"
            />
          </g>

          <g class="editing" v-if="branchsInEditing">
            <path
              v-for="branch in branchsInEditing"
              :key="branch.sindex"
              class="branch"
              :d="branch.d"
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
                    waypoint.z.toFixed(3) +
                    " (" +
                    waypoint.y.toFixed(3) +
                    ")" +
                    "\nBranches:\n" +
                    waypoint
                      .branches()
                      .map((p) => "# " + p.index)
                      .join("\n")
                  : ""
              }}
            </title>
            <circle
              @mousedown.self.stop="wptMouseBtn({ event: $event, waypoint })"
              @mouseup.self.stop="wptMouseBtn({ event: $event, waypoint })"
              @mousemove.self.stop="mapMouseMove"
              :class="[
                waypoint.isNode() ? 'node' : 'waypoint',
                {
                  marker: waypoint.marker ? true : false,
                  draggable:
                    wptDragging &&
                    wptDragging.dragged &&
                    wptDragging.waypoint === waypoint,
                },
              ]"
              :cx="waypoint.x"
              :cy="waypoint.z"
              :r="waypoint.marker ? 1.2 : waypoint.isNode() ? 0.5 : 0.3"
            />
          </g>
        </g>

        <g class="selection">
          <path
            @mouseup="wptMouseBtn({ event: $event })"
            v-for="({ branch, highlight }, selIndex) in selectedBranches"
            :key="selIndex"
            class="branch"
            :class="{ highlight }"
            :d="branch.d"
          />

          <circle
            class="waypoint"
            v-for="{ waypoint, highlight } in selectedWpts"
            :key="waypoint.index"
            :class="{
              highlight,
              single:
                editor.selection.length === 1 && selectedWpts.length === 1,
            }"
            :cx="waypoint.x"
            :cy="waypoint.z"
            :r="waypoint.marker ? 1.4 : waypoint.isNode() ? 0.7 : 0.5"
          ></circle>
        </g>

        <g v-if="editor.preview" class="preview">
          <template v-if="this.editor.preview.line">
            <path class="line" :d="pathDef(this.editor.preview.line)" />
          </template>
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
    wptDragging: false,
  }),
  props: {
    editor: Object,
    selection: Array,
    mapImageURL: String,
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
    selectedBranches() {
      return this.selection
        .filter((item) => item && item.branch)
        .map((item) => {
          item.branch.d = this.pathDef(item.branch.wpts);
          return item;
        });
    },
    selectedWpts() {
      return this.selection.filter((item) => item && item.waypoint);
    },
    branchsInEditing() {
      if (
        this.wptDragging &&
        this.wptDragging.dragged &&
        this.wptDragging.waypoint
      ) {
        return this.wptDragging.waypoint.branches().map((p, index) => {
          return { index, d: this.pathDef(p.wpts) };
        });
      }
      return null;
    },
    drawnBranches() {
      return this.editor.map.branches.map((branch) => {
        let reduced = this.reducePath(branch.wpts);

        let dbranch = Object.fromEntries(Object.entries(branch));

        delete dbranch.wpts;

        dbranch.segments = branch.wpts.length - 1;
        dbranch.reducedsegments = reduced.length - 1;
        dbranch.d = this.pathDef(reduced);
        dbranch.original = branch;

        return dbranch;
      });
    },
    segments() {
      return this.drawnBranches.reduce(
        (segments, branch) => {
          return {
            total: segments.total + branch.segments,
            reduced: segments.reduced + branch.reducedsegments,
          };
        },
        {
          total: 0,
          reduced: 0,
        }
      );
    },
    mapBoundsPoints() {
      return [
        [-this.editor.map.size / 2, -this.editor.map.size / 2].join(","),
        [this.editor.map.size / 2, -this.editor.map.size / 2].join(","),
        [this.editor.map.size / 2, this.editor.map.size / 2].join(","),
        [-this.editor.map.size / 2, this.editor.map.size / 2].join(","),
      ].join(" ");
    },
  },
  methods: {
    pathDef(wpts) {
      return "M" + wpts.map((wpt) => [wpt.x, wpt.z].join(",")).join(" L");
    },
    mapMouseMove(event) {
      this.mouse = this.mouseEventMapCoords(event);

      if (event.button === 0 && this.wptDragging) {
        if (
          !this.wptDragging.dragged &&
          Math.pow(event.movementX, 2) + Math.pow(event.movementY, 2) > 9
        ) {
          this.wptDragging.dragged = true;
        }

        if (this.wptDragging.dragged) {
          this.wptDragging.waypoint.x = +(
            this.mouse.x - this.wptDragging.offset.x
          ).toFixed(3);
          this.wptDragging.waypoint.z = +(
            this.mouse.y - this.wptDragging.offset.y
          ).toFixed(3);
        }
      }
    },
    wptMouseBtn({ event, waypoint }) {
      if (event.button === 0) {
        if (event.type === "mousedown" && waypoint) {
          this.wptDragging = {
            waypoint,
            offset: {
              x: this.mouse.x - waypoint.x,
              y: this.mouse.y - waypoint.z,
            },
            dragstart: { x: waypoint.x, z: waypoint.z },
            dragged: false,
          };
        }

        if (this.wptDragging && event.type === "mouseup") {
          if (this.wptDragging.dragged) {
            this.$emit("wpt-dragged", this.wptDragging);
          } else if (waypoint) {
            this.$emit("wpt-click", { event, waypoint });
          }
          this.wptDragging = false;
        }
      }
    },

    mouseEventMapCoords(event) {
      return this.handler.getSvgPoint({ x: event.offsetX, y: event.offsetY });
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
            svgpoint: this.mouseEventMapCoords(event),
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
    },
  },
  beforeDestroy: function() {
    window.removeEventListener("resize", this.windowResize);
  },

  mounted() {
    this.handler = new svghandling(this.$refs.svgMap);
    window.addEventListener("resize", this.windowResize);
  },
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

.branches .branch {
  fill: none;
  stroke-linecap: round;
  stroke: rgb(75, 255, 75);
  stroke-opacity: 0.6;
  stroke-width: 1.5;
}

.branches .editing .branch {
  stroke: rgb(97, 68, 14);
  stroke-opacity: 1;
  stroke-width: 0.4;
}

.branches .branch:hover {
  stroke-opacity: 1;
}

.branches .branch.bidirectional {
  stroke: rgb(251, 47, 251);
}

.branches .branch.reverse {
  stroke: rgb(47, 251, 251);
}

.branches .branch.unidirectional,
.branches .branch.reverse {
  marker-mid: url(#arrow);
  marker-start: url(#arrow);
}

.branches marker branch {
  stroke-width: 0.1;
  stroke: rgb(6, 77, 6);
  fill: transparent;
}

.selection .branch {
  fill: none;
  stroke-linecap: round;
  stroke: rgb(9, 0, 139);
  stroke-width: 0.3;
}

.selection .waypoint {
  fill: none;
  stroke-width: 0.3;
  stroke: rgb(9, 0, 139);
}

.selection .highlight {
  stroke: rgb(212, 0, 219);
  stroke-width: 0.5;
}

.preview .line {
  fill: none;
  stroke: rgb(212, 0, 219);
  stroke-width: 0.2;
}

.selection .waypoint.single {
  stroke: rgb(12, 255, 24);
}
</style>
