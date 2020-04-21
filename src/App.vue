<template>
  <div id="app" class="flex flex-row h-screen w-screen items-stretch">
    <!-- Left Col -->
    <div
      class="flex flex-grow-0 flex-col items-stretch p-2"
      style="width: 16em;"
    >
      <Card class="flex-grow-0 mb-2">
        <template #title>
          Files
        </template>
        <LoadRoute
          @loading-status="mapLoading = $event"
          @map-image-change="mapImageURL = $event"
          @map-xml-loaded="mapLoaded"
          :cansave="!mapLoading && !!editor"
          @save-map="saveMap"
        />

        <div class="flex" v-if="error">
          <span class="text-red-600 font-bold w-full " v-text="error" />
        </div>
      </Card>

      <template v-if="!mapLoading && editor">
        <Card
          v-if="editor.selection.length"
          :collapsable="false"
          class="flex-grow-0 mb-2"
        >
          <template #title>
            Selected items
          </template>
          <ul>
            <li
              v-for="(item, index) in editor.selection"
              :key="selectionItemKey(item)"
              @mouseenter="mouseOver('selection', $event, { item })"
              @mouseleave="mouseOver('selection', $event, { item })"
            >
              <v-popover
                :disabled="selectionItemCmds(item, index).length === 0"
                placement="right"
                openClass="bg-pink-300"
                class="v-popover--block cursor-pointer hover:bg-pink-300"
                popoverInnerClass="bg-gray-200 p-2 rounded shadow flex flex-row"
              >
                <div class="tooltip-target">
                  <div v-if="item.waypoint">
                    <span>Waypoint # {{ item.waypoint.index }}</span>
                    <span
                      v-if="item.waypoint.marker"
                      v-text="item.waypoint.marker.name"
                      class="ml-1 font-bold"
                    />
                  </div>
                  <div v-if="item.branch">
                    <span
                      >Branch # {{ item.branch.index }} ({{
                        item.branch.wpts.length
                      }}
                      wpts)</span
                    >
                  </div>
                </div>

                <template slot="popover">
                  <div
                    class="flex-col mb-1"
                    v-for="cmdGroup in selectionItemCmds(item, index)"
                    :key="cmdGroup.group"
                    @mouseenter="mouseOver('selection', $event, { item })"
                    @mouseleave="mouseOver('selection', $event, { item })"
                  >
                    <button
                      @click="selectionItemCmd({ item, index, cmd })"
                      v-for="cmd in cmdGroup.cmds"
                      :key="cmd.value"
                      class="flex bg-gray-300 hover:bg-gray-400 p-1 whitespace-no-wrap"
                      v-tooltip.right="cmd.label"
                    >
                      <span
                        class="material-icons fill-current"
                        v-text="cmd.icon"
                      />
                    </button>
                  </div>
                </template>
              </v-popover>
            </li>
          </ul>
          <div class="flex flex-row text-xs">
            <button
              v-if="editor.selection.length"
              @click="emptySelection"
              class="m-1 p1 w-full border shadow has-tooltip"
            >
              Empty
            </button>
            <button
              v-if="editor.selection.length > 1"
              @click="reverseSelection"
              class="m-1 p1 w-full border shadow has-tooltip"
            >
              Reverse
            </button>
          </div>
        </Card>

        <Card :collapsable="false" class="flex-grow mb-2">
          <template #title>
            Tools
          </template>

          <div
            v-for="toolInstance in editor.toolsAvailable"
            :key="toolInstance.action"
            class="flex flex-col self-stretch mb-1"
            :class="{ dropdown: toolInstance.options }"
          >
            <button
              @mouseenter="
                if (!toolInstance.options) {
                  mouseOver('toolInstance', $event, { toolInstance });
                }
              "
              @mouseleave="
                if (!toolInstance.options) {
                  mouseOver('toolInstance', $event, { toolInstance });
                }
              "
              @click="
                if (!toolInstance.options) {
                  toolAction(toolInstance);
                }
              "
              class="inline-flex items-stretch bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded"
              v-tooltip.right="toolInstance.description"
            >
              <span
                class="material-icons fill-current mr-1"
                v-text="toolInstance.icon"
              />
              <span v-text="toolInstance.label" />
              <span v-if="toolInstance.options">🠋</span>
            </button>
            <ul
              v-if="toolInstance.options"
              class="flex flex-col self-stretch dropdown-content absolute hidden text-gray-800 pt-1 mt-8"
            >
              <li
                class="flex block self-stretch"
                v-for="option in toolInstance.options"
                :key="option.index"
              >
                <button
                  @mouseenter="
                    mouseOver('toolInstance', $event, { toolInstance, option })
                  "
                  @mouseleave="
                    mouseOver('toolInstance', $event, { toolInstance, option })
                  "
                  @click="toolAction(toolInstance, option)"
                  class="flex w-full items-stretch bg-gray-300 hover:bg-gray-400 p-1 whitespace-no-wrap"
                  v-tooltip.right="option.description"
                >
                  <span
                    v-if="option.icon"
                    class="material-icons fill-current mr-1"
                    v-text="option.icon"
                  />
                  <span v-text="option.label" />
                </button>
              </li>
            </ul>
          </div>
        </Card>

        <Card
          class="flex-grow-0"
          v-if="editor && (editor.actions.length || editor.redoables.length)"
        >
          <template #title>
            Undo/Redo
          </template>
          <div class="flex flex-row">
            <div class="flex-1 m-1">
              <button
                class="w-full border shadow"
                @click="undo"
                v-if="editor.actions.length"
                v-tooltip.top="editor.actions.slice(-1)[0].label"
              >
                Undo
              </button>
            </div>
            <div class="flex-1 m-1">
              <button
                class="w-full  border shadow"
                @click="redo"
                v-if="editor.redoables.length"
                v-tooltip.top="editor.redoables.slice(-1)[0].label"
              >
                Redo
              </button>
            </div>
          </div>
        </Card>

        <Card class="flex-grow-0">
          <template #title>
            Info
          </template>
          <div class="flex flex-col text-sm">
            <span class="flex text-center">
              <label class="mr-1" for="mapsize">Map Size</label>
              <input
                type="number"
                id="mapsize"
                list="sizes"
                v-model="editor.map.size"
              />
              <datalist id="sizes">
                <option
                  v-for="(desc, size) in defaultMapSizes"
                  :key="size"
                  :value="size"
                  v-text="desc"
                />
              </datalist>

              <span v-if="factor" class="ml-1">({{ factor }})</span>
            </span>

            <span class="flex text-center">
              Waypoints: {{ editor.map.waypointsArray().length }}
            </span>
            <span class="flex text-center">
              Branches: {{ editor.map.branches.length }}
            </span>
          </div>
        </Card>
      </template>
      <Card>
        <div class="text-xs">
          For info and help see
          <a
            class="font-semibold text-gray-700 underline hover:text-gray-800 hover:no-underline"
            href="https://github.com/manierim/adeditor#main-features"
            target="_blank"
            >readme on GitHub</a
          >
        </div>
      </Card>
    </div>
    <Map
      @map-click="mapClick"
      @branch-click="branchClick"
      @wpt-click="wptClick"
      @wpt-dragged="wptDragged"
      class="flex flex-grow border border-gray-400 rounded shadow-md m-2 ml-0 p-2"
      v-if="!mapLoading && editor"
      :mapImageURL="mapImageURL"
      :editor="editor"
      :selection="selectionWithHL"
    />
  </div>
</template>

<script>
import LoadRoute from "./components/LoadRoute";
import Map from "./components/Map";

import Card from "./components/partials/Card";
import Editor from "./utils/editor";

export default {
  name: "App",
  components: {
    Card,
    LoadRoute,
    Map,
  },
  data: () => ({
    editor: null,
    mapImageURL: null,
    mapLoading: false,
    error: null,
    defaultMapSizes: {
      2048: "default",
      4096: "4x",
      8192: "8x",
    },
    highlight: {
      selection: null,
    },
  }),
  computed: {
    selectionWithHL() {
      return this.editor.selection.map((item) => {
        item.highlight =
          this.highlight.selection === this.selectionItemKey(item);
        return item;
      });
    },
    factor() {
      if (!this.editor || !this.editor.map.size) {
        return null;
      }

      if (this.defaultMapSizes[this.editor.map.size]) {
        return this.defaultMapSizes[this.editor.map.size];
      }

      return "custom";
    },
  },

  mounted() {
    window.addEventListener("keydown", (event) => {
      if (this.editor && this.editor.keyUp(event)) {
        this.highlight.selection = null;
        event.preventDefault();
      }
    });
  },

  methods: {
    selectionItemKey(item) {
      if (item.waypoint) {
        return "waypoint-" + item.waypoint.index;
      }
      if (item.branch) {
        return "branch-" + item.branch.index;
      }
    },
    selectionItemCmds(item, index) {
      let grps = [];

      let cmds = [];

      if (index > 1) {
        cmds.push({
          label: "Move to top",
          icon: "vertical_align_top",
          value: "top",
        });
      }
      if (index > 0) {
        cmds.push({
          label: "Move up",
          icon: "keyboard_arrow_up",
          value: "up",
        });
      }

      let lastIndex = this.editor.selection.length - 1;

      if (index < lastIndex) {
        cmds.push({
          label: "Move down",
          icon: "keyboard_arrow_down",
          value: "down",
        });
      }

      if (index < lastIndex - 1) {
        cmds.push({
          label: "Move to bottom",
          icon: "vertical_align_bottom",
          value: "bottom",
        });
      }

      if (cmds.length) {
        grps.push({
          group: "move",
          cmds,
        });
      }

      if (item.branch) {
        grps.push({
          group: "branch",
          cmds: [
            {
              label: "Expand to wapypoints",
              icon: "open_with",
              value: "expand",
            },
          ],
        });
      }

      cmds = [];

      if (index > 1) {
        cmds.push({
          label: "Remove all before",
          icon: "vertical_align_bottom",
          value: "removeBefore",
        });
      }

      cmds.push({
        label: "Remove from selection",
        icon: "delete",
        value: "remove",
      });

      if (index < lastIndex) {
        cmds.push({
          label: "Remove all after",
          icon: "vertical_align_top",
          value: "removeAfter",
        });
      }

      grps.push({
        group: "remove",
        cmds,
      });

      return grps;
    },

    emptySelection() {
      this.editor.emptySelection();
    },

    reverseSelection() {
      this.editor.reverseSelection();
    },

    selectionItemCmd(params) {
      this.editor.selectionItemCmd(params);
    },
    async saveMap() {
      if (!this.editor || !this.editor.map) {
        return;
      }
      this.editor.map.save();
    },
    mapLoaded(response) {
      this.error = response.error;
      if (response.map) {
        this.editor = new Editor(response.map);
      }
    },
    undo() {
      this.editor.undo();
    },
    redo() {
      this.editor.redo();
    },
    toolAction(toolInstance, option) {
      this.editor.toolAction(toolInstance, option);
    },
    mapClick({ event, svgpoint }) {
      this.editor.mapClick({ event, svgpoint });
    },
    branchClick(event) {
      this.editor.branchClick(event);
    },
    wptClick(event) {
      this.editor.wptClick(event);
    },
    wptDragged(event) {
      this.editor.wptDragged(event);
    },
    mouseOver(elementType, event, data) {
      if (elementType === "selection") {
        let { item } = data;

        if (event.type === "mouseenter") {
          this.highlight.selection = this.selectionItemKey(item);
        }

        if (event.type === "mouseleave") {
          this.highlight.selection = null;
        }
        return;
      }

      if (elementType === "toolInstance") {
        let { toolInstance, option } = data;
        this.editor.toolAction(toolInstance, option, event.type);
        return;
      }
    },
  },
};
</script>

<style>
.v-popover--block,
.v-popover--block > .trigger {
  display: block !important;
}
</style>

<style scoped>
input[type="number"] {
  text-align: center;
}

#mapsize {
  width: 5em;
}
.dropdown:hover > .dropdown-content {
  display: block;
}
</style>
