import Map from "./Map";

export async function mapFromXMLFile(xmlString, fileName) {
  let response = {
    map: null,
    error: null,
  };

  let parseString = require("xml2js").parseStringPromise;

  let xml;

  try {
    xml = await parseString(xmlString);
  } catch (err) {
    response.error = err;
    return response;
  }

  let fileType = null;
  let root = null;
  let mapname = null;

  if (xml.AutoDrive) {
    root = xml.AutoDrive;
    fileType = "config";

    mapname = fileName.match(/^AutoDrive_(.*)_config.xml$/);
    if (mapname.length == 2) {
      mapname = mapname[1];
    } else {
      response.error = "Could not find map name in " + fileName + " filename.";
      return response;
    }

    if (!root[mapname]) {
      response.error =
        "Could not find " + mapname + " element in xml document.";
      return response;
    }
    root = root[mapname][0];
  }

  if (xml.routeExport) {
    root = xml.routeExport;
    fileType = "routeManagerExport";
  }
  if (!fileType) {
    response.error = "Unknown file type";
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

  response.map = new Map(
    fileName,
    xml,
    fileType,
    mapname,
    x,
    y,
    z,
    outs,
    ins,
    markers
  );

  return response;
}
