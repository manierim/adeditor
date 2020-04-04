class Waypoint {
  constructor(x, y, z) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.z = parseFloat(z);
    this.marker = null;
    this._links = {};
  }

  addLinkToNode(toNodeId, isOut) {
    if (!this._links[toNodeId]) {
      this._links[toNodeId] = isOut;
      return;
    }

    if (this._links[toNodeId] === null || this._links[toNodeId] === isOut) {
      return;
    }

    this._links[toNodeId] === null;
  }

  linkedNodes() {
    return Object.keys(this._links);
  }

  linkTNodeIsOut(nodeId) {
    return this._links[nodeId];
  }
}

class Link {
  constructor(source, target) {
    this.source = source;
    this.target = target;
    this.bidirectional = false;
  }
}

class LinksList {
  constructor() {
    this.links = [];
    this.registry = {};
  }

  addLink(source, target) {
    let a = source;
    let b = target;
    if (a > b) {
      a = target;
      b = source;
    }
    let key = a + "," + b;
    if (!this.registry[key]) {
      this.registry[key] = this.links.length;
      this.links.push(new Link(source, target));
    } else {
      let link = this.links[this.registry[key]];
      if ((link.source === target) & (link.target === source)) {
        link.bidirectional = true;
      }
    }
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
      let wpt = new Waypoint(x[index], y[index], z[index]);

      [ins, outs].forEach((list, listIndex) => {
        list[index].split(",").forEach((nodeIdStr) => {
          let nodeId = parseInt(nodeIdStr);
          if (nodeId > 0) {
            wpt.addLinkToNode(nodeId, listIndex === 1);
          }
        });
      });

      this.waypoints.push(wpt);
    }

    let factor = Math.ceil(Math.log(max * 2) / Math.log(2048));
    this.mapSize = factor * 2048;

    this.paths = [];



    this.registry = new LinksList();

    [ins, outs].forEach((list, listIndex) => {
      for (let index = 0; index < list.length; index++) {
        list[index].split(",").forEach(nodeIdStr => {
          let nodeId = parseInt(nodeIdStr);
          if (nodeId > 0) {
            let source = nodeId;
            let target = index + 1;
            if (listIndex === 1) {
              source = target;
              target = nodeId;
            }
            this.registry.addLink(source, target);
          }
        });
      }
    });

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
  }
}
