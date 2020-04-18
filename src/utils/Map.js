import Waypoint from "./waypoint";
import Vue from "vue";

export default class Map {
  parser;
  cache;
  waypoints;
  size;
  paths;
  lastid;

  constructor(parser) {
    this.parser = parser;

    this.cache = {};
    this.waypoints = {};
    this.lastid = 0;

    let parsed = this.parser.parse();

    let max = 0;

    for (let index = 0; index < parsed.x.length; index++) {
      if (Math.abs(parsed.x[index]) > max) {
        max = Math.abs(parsed.x[index]);
      }
      if (Math.abs(parsed.z[index]) > max) {
        max = Math.abs(parsed.z[index]);
      }
      let id = index + 1;
      if (parsed.id) {
        id = parseInt(parsed.id[index]);
      }

      let linkedArray = (list) =>
        list
          .split(",")
          .map((linkedStr) => parseInt(linkedStr))
          .filter((linkedId) => linkedId > 0);

      let wpt = new Waypoint(
        this,
        id,
        parseFloat(parsed.x[index]),
        parseFloat(parsed.y[index]),
        parseFloat(parsed.z[index]),
        linkedArray(parsed.ins[index]),
        linkedArray(parsed.outs[index])
      );

      this.waypoints[id] = wpt;
      if (id > this.lastid) {
        this.lastid = id;
      }
    }

    let size = 2048;
    if (max) {
      size = Math.pow(2, Math.ceil(Math.log2(Math.ceil(max / 1024)))) * 2048;
    }

    this.size = size;

    parsed.markers.forEach((marker) => {
      this.waypoints[marker.index].marker = marker;
    });

    this.buildPaths();
  }

  addWaypoint({ waypoint, x, y, z }) {
    if (!waypoint) {
      let id = ++this.lastid;

      waypoint = new Waypoint(
        this,
        id,
        parseFloat(x),
        parseFloat(y),
        parseFloat(z),
        [],
        []
      );
    }

    Vue.set(this.waypoints, waypoint.index, waypoint);

    if (this.cache["inFromOuts"]) {
      this.cache["inFromOuts"][waypoint.index] = [];
    }
    return waypoint;
  }
  removeWaypoint(index) {
    if (!this.waypoints[index]) {
      return;
    }
    Vue.delete(this.waypoints, index);
    return true;
  }

  waypointsArray() {
    return Object.entries(this.waypoints).map((kv) => kv[1]);
  }

  markers() {
    return this.waypointsArray()
      .filter((wpt) => wpt.marker)
      .map((wpt) => {
        wpt.marker.wpt = wpt;
        return wpt.marker;
      });
  }

  save() {
    let content = this.parser.getContentForSave(
      this.waypointsArray(),
      this.markers()
    );

    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", this.parser.fileName);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  buildPaths() {
    if (!this.waypointsArray().length) {
      this.paths = [];
      return;
    }

    let paths = [];
    this.cache = {};

    let BidirectionalInitialWaypointsDone = [];
    let doneNodes = [];

    let buildPathsForNode = (node) => {
      if (doneNodes.indexOf(node.index) !== -1) {
        return;
      }
      doneNodes.push(node.index);

      ["bidirectional", "out", "reverse-out"].forEach((linkType) => {
        // build paths from this node
        node.linksofType(linkType).forEach((linkedNodeIndex) => {
          if (
            linkType === "bidirectional" &&
            BidirectionalInitialWaypointsDone.indexOf(linkedNodeIndex) !== -1
          ) {
            return;
          }
          let wpts = [node];

          let linkedNode = this.waypoints[linkedNodeIndex];
          if (!linkedNode) {
            console.warn("cannot find waypoint #", linkedNodeIndex);
            return;
          }

          wpts.push(linkedNode);

          let prevwpt = node;

          while (
            linkedNode &&
            !linkedNode.isNode() &&
            linkedNode.index !== node.index
          ) {
            prevwpt = linkedNode;

            let nextWptIndex = linkedNode
              .linkedWpts()
              .filter((id) => id !== wpts.slice(-2, -1)[0].index)[0];

            linkedNode = this.waypoints[nextWptIndex];

            if (!linkedNode) {
              console.warn("cannot find waypoint #", nextWptIndex);
              continue;
            }

            wpts.push(linkedNode);
          }

          if (linkType === "bidirectional") {
            BidirectionalInitialWaypointsDone.push(prevwpt.index);
          }

          let path = {
            index: paths.length,
            bidirectional: linkType === "bidirectional",
            reverse: linkType === "reverse-out",
            wpts: wpts,
          };

          wpts.forEach((wptInPath) => {
            wptInPath.addPath(path);
          });

          paths.push(path);
        });
      });
    };

    let donePathWaypoints = [];

    this.waypointsArray().forEach((wpt) => {
      if (
        !wpt.linkedWpts().length ||
        donePathWaypoints.indexOf(wpt.index) !== -1
      ) {
        return;
      }

      let pathNodes = [];
      let prev = null;

      while (!wpt.isNode() && pathNodes.indexOf(wpt.index) === -1) {
        donePathWaypoints.push(wpt.index);

        pathNodes.push(wpt.index);

        let next = wpt.linkedWpts()[0];

        if (prev !== null && next === prev) {
          next = wpt.linkedWpts()[1];
        }
        prev = wpt.index;
        wpt = this.waypoints[next];
      }

      buildPathsForNode(wpt);
    });

    this.paths = paths;
  }
}
