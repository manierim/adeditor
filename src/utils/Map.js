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
      let id = index + 1;
      if (parsed.id) {
        id = parsed.id[index];
      }

      let linkedArray = list =>
        list
          .split(",")
          .map(linkedStr => parseInt(linkedStr))
          .filter(linkedId => linkedId > 0);

      let wpt = new Waypoint(
        this,
        id,
        parsed.x[index],
        parsed.y[index],
        parsed.z[index],
        linkedArray(parsed.ins[index]),
        linkedArray(parsed.outs[index])
      );

      this.waypoints[id] = wpt;
    }

    let size = 2048;
    if (max) {
      size = Math.pow(2, Math.ceil(Math.log2(Math.ceil(max / 1024)))) * 2048;
    }

    this.size = size;

    parsed.markers.forEach(marker => {
      this.waypoints[marker.index].marker = marker;
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

  async save() {
    return await this.parser.write(this.waypointsArray(), this.markers());
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

      ["bidirectional", "out", "reverse-out"].forEach(linkType => {
        // build paths from this node
        node.linksofType(linkType).forEach(linkedNodeIndex => {
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
              .filter(id => id !== wpts.slice(-2, -1)[0].index)[0];

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

          wpts.forEach(wptInPath => {
            wptInPath.addPath(paths.length);
          });

          paths.push({
            index: paths.length,
            bidirectional: linkType === "bidirectional",
            reverse: linkType === "reverse-out",
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
