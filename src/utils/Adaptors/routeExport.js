export default class parser {
  xml;
  fileName;
  mapname;
  constructor(xml, fileName) {
    this.xml = xml;
    this.fileName = fileName;
  }

  async write(wptsArray, markers) {
    let wptsRoot = this.xml.routeExport.waypoints[0];

    let indexMap = wptsArray.map(wpt => parseInt(wpt.index));

    wptsRoot["$"].c = wptsArray.length;

    wptsRoot["x"] = wptsArray.map(wpt => wpt.x).join(";");
    wptsRoot["y"] = wptsArray.map(wpt => wpt.y).join(";");
    wptsRoot["z"] = wptsArray.map(wpt => wpt.z).join(";");

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
    wptsRoot["in"] = wptsArray
      .map(wpt => links(wpt.existingIns()).join(","))
      .join(";");

    let defaultFolder = "All";

    let folders = [defaultFolder];

    this.xml.routeExport.markers[0]["m"] = markers.map(marker => {
      let folder = marker.folder ? marker.folder : defaultFolder;
      if (folders.indexOf(folder) === -1) {
        folders.push(folder);
      }
      return {
        $: {
          i: indexMap.indexOf(parseInt(marker.wpt.index)) + 1,
          n: marker.name,
          g: folder
        }
      };
    });

    this.xml.routeExport.groups[0]["g"] = folders.map(folder => {
      return {
        $: {
          n: folder
        }
      };
    });

    let xml2js = require("xml2js");

    let builder = new xml2js.Builder({
      headless: true
    });
    let content = builder.buildObject(this.xml);

    console.log(content);
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
