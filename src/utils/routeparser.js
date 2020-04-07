class Waypoint {
  constructor(index, x, y, z) {
    this.index = index;
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.z = parseFloat(z);
    this.marker = null;
    this.links = {};
    this.paths = [];
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

  addPath(pathIndex) {
    this.paths.push(pathIndex);
  }
}

export default class routeParser {
  constructor(xml, fileName) {
    this.xml = xml;
    this.fileName = fileName;
  }

  async parse() {
    let response = {
      map: null,
      error: null,
    };

    let parseString = require("xml2js").parseStringPromise;

    let result;

    try {
      result = await parseString(this.xml);
    } catch (err) {
      response.error = err;
      return response;
    }

    let fileType = null;
    let root = null;
    let mapname = null;

    if (result.AutoDrive) {
      root = result.AutoDrive;
      fileType = "config";

      mapname = this.fileName.match(/^AutoDrive_(.*)_config.xml$/);
      if (mapname.length == 2) {
        mapname = mapname[1];
      } else {
        response.error =
          "Could not find map name in " + this.fileName + " filename.";
        return response;
      }

      if (!root[mapname]) {
        response.error =
          "Could not find " + mapname + " element in xml document.";
        return response;
      }
      root = root[mapname][0];
    }

    if (result.routeExport) {
      root = result.routeExport;
      fileType = "routeManagerExport";
    }
    if (!fileType) {
      response.error = "Unknown file type";
      return response;
    }

    if (!root.waypoints) {
      response.error = "Cannot find waypoints";
      return response;
    }

    if (!root.waypoints || root.waypoints.length !== 1) {
      response.error = "Cannot find waypoints";
      return response;
    }

    let sep = ",";
    let insNode = "incoming";

    if (fileType === "routeManagerExport") {
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
      response.error =
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
      return response;
    }

    let waypoints = [];

    let max = 0;

    for (let index = 0; index < x.length; index++) {
      if (Math.abs(x[index]) > max) {
        max = Math.abs(x[index]);
      }
      if (Math.abs(z[index]) > max) {
        max = Math.abs(z[index]);
      }
      let wpt = new Waypoint(waypoints.length, x[index], y[index], z[index]);

      [ins, outs].forEach((list, listIndex) => {
        list[index].split(",").forEach((nodeIdStr) => {
          let nodeIndex = parseInt(nodeIdStr) - 1;
          if (nodeIndex >= 0) {
            wpt.addLinkToWpt(nodeIndex, listIndex === 1);
          }
        });
      });
      waypoints.push(wpt);
    }

    let size = 2048;
    if (max) {
      size = Math.pow(2, Math.ceil(Math.log2(Math.ceil(max / 1024)))) * 2048;
    }

    let markers = [];

    if (fileType === "routeManagerExport" && root.markers) {
      root.markers[0].m.forEach((marker) => {
        markers.push({
          index: parseInt(marker.$.i),
          name: marker.$.n,
          folder: marker.$.g,
        });
      });
    }

    if (fileType === "config" && root.mapmarker) {
      for (const key in root.mapmarker[0]) {
        const marker = root.mapmarker[0][key][0];
        markers.push({
          index: parseInt(marker.id[0]),
          name: marker.name[0],
          folder: marker.group[0],
        });
      }
    }

    markers = markers.map((marker) => {
      marker.wptIndex = marker.index - 1;
      marker.wpt = waypoints[marker.wptIndex];
      marker.wpt.marker = marker;
      return marker;
    });

    response.map = {
      fileType,
      mapname,
      size,
      waypoints,
      markers,
      paths: this.buildPaths(waypoints),
    };

    return response;
  }

  buildPaths(waypoints) {
    let paths = [];

    if (!waypoints.length) {
      return paths;
    }

    let BidirectionalInitialWaypointsDone = [];
    let doneNodes = [];

    let buildPathsForNode = (node) => {
      if (doneNodes.indexOf(node.index) !== -1) {
        return;
      }
      doneNodes.push(node.index);

      [null, true].forEach((linkType) => {
        // build paths from this node
        node.linksofType[linkType].forEach((linkedNodeIndex) => {
          if (
            BidirectionalInitialWaypointsDone.indexOf(linkedNodeIndex) !== -1
          ) {
            return;
          }
          let wpts = [node];

          let linkedNode = waypoints[linkedNodeIndex];

          wpts.push(linkedNode);

          let prevwpt = node;

          while (!linkedNode.isNode() && linkedNode.index !== node.index) {
            prevwpt = linkedNode;
            linkedNode =
              waypoints[
                linkedNode
                  .linkedWpts()
                  .filter((id) => id !== wpts.slice(-2, -1)[0].index)[0]
              ];
            wpts.push(linkedNode);
          }

          if (linkType === null) {
            BidirectionalInitialWaypointsDone.push(prevwpt.index);
          }

          wpts.forEach((wptInPath) => {
            wptInPath.addPath(paths.length);
          });

          paths.push({
            index: paths.length,
            bidirectional: linkType === null,
            wpts: wpts,
          });
        });
      });
    };

    let donePathWaypoints = [];

    waypoints.forEach((wpt) => {
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
        wpt = waypoints[next];
      }

      buildPathsForNode(wpt);
    });

    return paths;
  }
}
