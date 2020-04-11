import Waypoint from "./waypoint";

export default class Map {
  parser;
  cache;
  waypoints;
  size;
  paths;

  constructor(parser) {
    this.parser = parser;

    this.cache = {};
    this.waypoints = {};

    let parsed = this.parser.parse();

    let max = 0;

    for (let index = 0; index < parsed.x.length; index++) {
      if (Math.abs(parsed.x[index]) > max) {
        max = Math.abs(parsed.x[index]);
      }
      if (Math.abs(parsed.z[index]) > max) {
        max = Math.abs(parsed.z[index]);
      }
      let wpt = new Waypoint(
        this,
        index,
        parsed.x[index],
        parsed.y[index],
        parsed.z[index]
      );

      [parsed.ins, parsed.outs].forEach((list, listIndex) => {
        list[index].split(",").forEach(nodeIdStr => {
          let nodeIndex = parseInt(nodeIdStr) - 1;
          if (nodeIndex >= 0) {
            wpt.addLinkToWpt(nodeIndex, listIndex === 1);
          }
        });
      });
      this.waypoints[index] = wpt;
    }

    let size = 2048;
    if (max) {
      size = Math.pow(2, Math.ceil(Math.log2(Math.ceil(max / 1024)))) * 2048;
    }

    this.size = size;

    parsed.markers.forEach(marker => {
      this.waypoints[marker.index - 1].marker = marker;
    });

    this.buildPaths();
  }

  waypointsArray() {
    return Object.entries(this.waypoints).map(kv => kv[1]);
  }

  markers() {
    return this.waypointsArray()
      .filter(wpt => wpt.marker)
      .map(wpt => {
        wpt.marker.wpt = wpt;
        return wpt.marker;
      });
  }

  buildPaths() {
    let paths = [];

    if (!this.waypointsArray().length) {
      return;
    }

    this.cache = {};

    let BidirectionalInitialWaypointsDone = [];
    let doneNodes = [];

    let buildPathsForNode = node => {
      if (doneNodes.indexOf(node.index) !== -1) {
        return;
      }
      doneNodes.push(node.index);

      [null, true].forEach(linkType => {
        // build paths from this node
        node.linksofType(linkType).forEach(linkedNodeIndex => {
          if (
            linkType === null &&
            BidirectionalInitialWaypointsDone.indexOf(linkedNodeIndex) !== -1
          ) {
            return;
          }
          let wpts = [node];

          let linkedNode = this.waypoints[linkedNodeIndex];

          wpts.push(linkedNode);

          let prevwpt = node;

          while (!linkedNode.isNode() && linkedNode.index !== node.index) {
            prevwpt = linkedNode;
            linkedNode = this.waypoints[
              linkedNode
                .linkedWpts()
                .filter(id => id !== wpts.slice(-2, -1)[0].index)[0]
            ];
            wpts.push(linkedNode);
          }

          if (linkType === null) {
            BidirectionalInitialWaypointsDone.push(prevwpt.index);
          }

          wpts.forEach(wptInPath => {
            wptInPath.addPath(paths.length);
          });

          paths.push({
            index: paths.length,
            bidirectional: linkType === null,
            wpts: wpts
          });
        });
      });
    };

    let donePathWaypoints = [];

    this.waypointsArray().forEach(wpt => {
      if (
        !wpt.linkedWpts().length ||
        donePathWaypoints.indexOf(wpt.index) !== -1
      ) {
        return;
      }

      let start = null;
      let prev = null;

      while (!wpt.isNode() && wpt.index !== start) {
        donePathWaypoints.push(wpt.index);
        if (start === null) {
          start = wpt.index;
        }

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
