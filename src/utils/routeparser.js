class Waypoint {
  constructor(index, x, y, z) {
    this.index = index;
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.z = parseFloat(z);
    this.marker = null;
    this.links = {};
  }

  addLinkToWpt(toNodeIndex, isOut) {
    this.linksofType = null;
    if (this.links[toNodeIndex] === undefined) {
      this.links[toNodeIndex] = isOut;
      return;
    }

    if (this.links[toNodeIndex] === null || this.links[toNodeIndex] === isOut) {
      return;
    }

    this.links[toNodeIndex] = null;
  }

  isNode() {
    if (this.linksofType === null) {
      this.linksofType = {};
      [false, true, null].forEach((linkType) => {
        this.linksofType[linkType] = this.linkedWpts().filter(
          (linkedNodeIndex) => this.linktoWptIsOut(linkedNodeIndex) === linkType
        );
      });
    }
    return !(
      this.linkedWpts().length === 2 &&
      (this.linksofType[null].length === 2 ||
        (this.linksofType[false].length === 1 &&
          this.linksofType[true].length === 1))
    );
  }

  linkedWpts() {
    return Object.keys(this.links).map((index) => parseInt(index));
  }

  linktoWptIsOut(index) {
    return this.links[index];
  }
}

export default class routeParser {
  constructor(xml, fileName) {
    this.xml = xml;
    this.fileName = fileName;
  }

  async parse() {
    this.error = null;
    let parseString = require("xml2js").parseStringPromise;

    let result;

    try {
      result = await parseString(this.xml);
    } catch (err) {
      this.error = err;
      return;
    }

    if (this.error) {
      return;
    }

    let type = null;
    let root = null;

    if (result.AutoDrive) {
      root = result.AutoDrive;
      type = "config";

      let mapname = this.fileName.match(/^AutoDrive_(.*)_config.xml$/);
      if (mapname.length == 2) {
        mapname = mapname[1];
      } else {
        this.error =
          "Could not find map name in " + this.fileName + " filename.";
        return;
      }

      if (!root[mapname]) {
        this.error = "Could not find " + mapname + " element in xml document.";
        return;
      }
      root = root[mapname][0];
    }

    if (result.routeExport) {
      root = result.routeExport;
      type = "routeManagerExport";
    }
    if (!type) {
      this.error = "Unknown file type";
      return;
    }
    this.fileType = type;

    if (!root.waypoints) {
      this.error = "Cannot find waypoints";
      return;
    }

    if (!root.waypoints || root.waypoints.length !== 1) {
      this.error = "Cannot find waypoints";
      return;
    }

    let sep = ",";
    let insNode = "incoming";

    if (type === "routeManagerExport") {
      sep = ";";
      insNode = "in";
    }

    let x = root.waypoints[0].x[0].split(sep);
    let y = root.waypoints[0].y[0].split(sep);
    let z = root.waypoints[0].z[0].split(sep);

    let outs = root.waypoints[0].out[0].split(";");
    let ins = root.waypoints[0][insNode][0].split(";");

    if (
      x.length !== y.length ||
      y.length !== z.length ||
      z.length !== outs.length ||
      outs.length !== ins.length
    ) {
      this.error =
        "x (" +
        x.length +
        "), " +
        "y (" +
        y.length +
        "), " +
        "z (" +
        z.length +
        "), " +
        "out (" +
        outs.length +
        "), " +
        "ins (" +
        ins.length +
        "), " +
        "data length not coherent";
      return;
    }

    this.waypoints = [];

    let max = 0;

    for (let index = 0; index < x.length; index++) {
      if (Math.abs(x[index]) > max) {
        max = Math.abs(x[index]);
      }
      if (Math.abs(z[index]) > max) {
        max = Math.abs(z[index]);
      }
      let wpt = new Waypoint(
        this.waypoints.length,
        x[index],
        y[index],
        z[index]
      );

      [ins, outs].forEach((list, listIndex) => {
        list[index].split(",").forEach((nodeIdStr) => {
          let nodeIndex = parseInt(nodeIdStr) - 1;
          if (nodeIndex >= 0) {
            wpt.addLinkToWpt(nodeIndex, listIndex === 1);
          }
        });
      });
      this.waypoints.push(wpt);
    }

    let factor = Math.ceil(Math.log(max * 2) / Math.log(2048));
    this.mapSize = factor * 2048;

    this.markers = [];

    if (type === "routeManagerExport") {
      root.markers[0].m.forEach((marker) => {
        this.markers.push({
          index: parseInt(marker.$.i),
          name: marker.$.n,
          folder: marker.$.g,
        });
      });
    } else {
      for (const key in root.mapmarker[0]) {
        const marker = root.mapmarker[0][key][0];
        this.markers.push({
          index: parseInt(marker.id[0]),
          name: marker.name[0],
          folder: marker.group[0],
        });
      }
    }

    this.markers.forEach((marker) => {
      this.waypoints[marker.index - 1].marker = marker;
    });

    this.paths = this.paths();
  }

  paths() {
    let paths = [];

    if (!this.waypoints.length) {
      return paths;
    }

    let BidirectionalInitialWaypointsDone = [];

    this.waypoints.forEach((wpt) => {
      if (!wpt.linkedWpts().length || !wpt.isNode()) {
        return;
      }

      [null, true].forEach((linkType) => {
        // build paths from this node
        wpt.linksofType[linkType].forEach((linkedNodeIndex) => {
          if (
            BidirectionalInitialWaypointsDone.indexOf(linkedNodeIndex) !== -1
          ) {
            return;
          }
          let path = [wpt];
          let wpts = [wpt];

          let linkedNode = this.waypoints[linkedNodeIndex];

          wpts.push(linkedNode);
          path.push(linkedNode);
          let prevwpt = wpt;

          let lastremoved = null;

          while (linkedNode && !linkedNode.isNode()) {
            prevwpt = linkedNode;
            linkedNode = this.waypoints[
              linkedNode
                .linkedWpts()
                .filter((id) => id !== wpts.slice(-2, -1)[0].index)[0]
            ];
            wpts.push(linkedNode);

            let beforeLastPathPoint;
            if (lastremoved) {
              beforeLastPathPoint = lastremoved;
            } else {
              beforeLastPathPoint = path.slice(-2, -1)[0];
            }

            let midPoint = {
              x: (linkedNode.x + beforeLastPathPoint.x) / 2,
              z: (linkedNode.z + beforeLastPathPoint.z) / 2,
            };

            let lastPathPoint = path.slice(-1)[0];

            let dist = Math.sqrt(
              Math.pow(midPoint.x - lastPathPoint.x, 2) +
                Math.pow(midPoint.z - lastPathPoint.z, 2)
            );

            if (dist < 0.15) {
              lastremoved = path.splice(-1, 1)[0];
            } else {
              lastremoved = null;
            }

            path.push(linkedNode);
          }

          if (linkType === null) {
            BidirectionalInitialWaypointsDone.push(prevwpt.index);
          }

          path = {
            bidirectional: linkType === null,
            segments: path.length - 1,
            d: "M" + path.map((wpt) => [wpt.x, wpt.z].join(",")).join(" L"),
          };
          paths.push(path);
        });
      });
    });

    return paths;
  }
}
