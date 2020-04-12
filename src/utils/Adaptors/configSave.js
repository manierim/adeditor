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
      id: null,
      x: null,
      y: null,
      z: null,
      outs: null,
      ins: null,
      markers: null
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

    response.id = root.waypoints[0].id[0].split(",");
    response.x = root.waypoints[0].x[0].split(",");
    response.y = root.waypoints[0].y[0].split(",");
    response.z = root.waypoints[0].z[0].split(",");

    response.outs = root.waypoints[0].out[0].split(";");
    response.ins = root.waypoints[0]["incoming"][0].split(";");

    if (
      response.id.length !== response.x.length ||
      response.x.length !== response.y.length ||
      response.y.length !== response.z.length ||
      response.z.length !== response.outs.length ||
      response.outs.length !== response.ins.length
    ) {
      response.error =
        "id (" +
        response.id.length +
        "), " +
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
          folder: marker.group[0]
        });
      }
    }
    return response;
  }

  async write(wptsArray, markers) {
    let wptsRoot = this.xml.AutoDrive[this.mapname][0].waypoints[0];

    let indexMap = wptsArray.map(wpt => parseInt(wpt.index));

    wptsRoot["id"] = wptsArray
      .map(wpt => indexMap.indexOf(wpt.index) + 1)
      .join(",");
    wptsRoot["x"] = wptsArray.map(wpt => wpt.x).join(",");
    wptsRoot["y"] = wptsArray.map(wpt => wpt.y).join(",");
    wptsRoot["z"] = wptsArray.map(wpt => wpt.z).join(",");

    function links(list) {
      list = list.map(idx => indexMap.indexOf(idx) + 1);
      if (!list.length) {
        list.push(-1);
      }
      return list;
    }

    wptsRoot["out"] = wptsArray
      .map(wpt => links(wpt.existingOuts()).join(","))
      .join(";");
    wptsRoot["incoming"] = wptsArray
      .map(wpt => links(wpt.existingIns()).join(","))
      .join(";");

    let defaultFolder = "All";

    this.xml.AutoDrive[this.mapname][0].mapmarker = {};

    markers.forEach((marker, idx) => {
      this.xml.AutoDrive[this.mapname][0].mapmarker["mm" + (idx + 1)] = {
        id: indexMap.indexOf(parseInt(marker.wpt.index)) + 1,
        name: marker.name,
        group: marker.folder ? marker.folder : defaultFolder
      };
    });

    let xml2js = require("xml2js");

    let builder = new xml2js.Builder({
      headless: false,
      xmldec: {
        version: "1.0",
        encoding: "UTF-8",
        standalone: false
      }
    });
    let content = builder.buildObject(this.xml);

    console.debug(content);
  }
}
