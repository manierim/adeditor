export default class parser {
  xml;
  fileName;
  mapname;
  constructor(xml, fileName) {
    this.xml = xml;
    this.fileName = fileName;
    this.fileType = "config";
  }

  parse() {
    let response = {
      error: null,
      map: null,
      x: null,
      y: null,
      z: null,
      outs: null,
      ins: null,
      markers: null,
    };

    let root;
    let mapname = this.fileName.match(/^AutoDrive_(.*)_config.xml$/);

    if (mapname.length == 2) {
      mapname = mapname[1];
    } else {
      response.error =
        "Could not find map name in " + this.fileName + " filename.";
      return response;
    }

    if (!this.xml.AutoDrive[mapname]) {
      response.error =
        "Could not find " + mapname + " element in xml document.";
      return response;
    }
    root = this.xml.AutoDrive[mapname][0];
    this.mapname = mapname;

    if (!root.waypoints || root.waypoints.length !== 1) {
      response.error = "Cannot find waypoints";
      return response;
    }

    response.x = root.waypoints[0].x[0].split(",");
    response.y = root.waypoints[0].y[0].split(",");
    response.z = root.waypoints[0].z[0].split(",");

    response.outs = root.waypoints[0].out[0].split(";");
    response.ins = root.waypoints[0]["incoming"][0].split(";");

    if (
      response.x.length !== response.y.length ||
      response.y.length !== response.z.length ||
      response.z.length !== response.outs.length ||
      response.outs.length !== response.ins.length
    ) {
      response.error =
        "x (" +
        response.x.length +
        "), " +
        "y (" +
        response.y.length +
        "), " +
        "z (" +
        response.z.length +
        "), " +
        "out (" +
        response.outs.length +
        "), " +
        "ins (" +
        response.ins.length +
        "), " +
        "data length not coherent";
      return response;
    }

    response.markers = [];

    if (root.mapmarker) {
      for (const key in root.mapmarker[0]) {
        const marker = root.mapmarker[0][key][0];
        response.markers.push({
          index: parseInt(marker.id[0]),
          name: marker.name[0],
          folder: marker.group[0],
        });
      }
    }
    return response;
  }
}
