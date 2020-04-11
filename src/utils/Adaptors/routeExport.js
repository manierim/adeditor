export default class parser {
  xml;
  fileName;
  mapname;
  constructor(xml, fileName) {
    this.xml = xml;
    this.fileName = fileName;
  }

  parse() {
    let response = {
      error: null,
      x: null,
      y: null,
      z: null,
      outs: null,
      ins: null,
      markers: null
    };

    let root = this.xml.routeExport;

    if (!root.waypoints || root.waypoints.length !== 1) {
      response.error = "Cannot find waypoints";
      return response;
    }

    response.x = root.waypoints[0].x[0].split(";");
    response.y = root.waypoints[0].y[0].split(";");
    response.z = root.waypoints[0].z[0].split(";");

    response.outs = root.waypoints[0].out[0].split(";");
    response.ins = root.waypoints[0]["in"][0].split(";");

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

    if (root.markers) {
      root.markers[0].m.forEach(marker => {
        response.markers.push({
          index: parseInt(marker.$.i),
          name: marker.$.n,
          folder: marker.$.g
        });
      });
    }

    return response;
  }
}
