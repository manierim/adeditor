import Map from "./Map";

export async function mapFromXMLFile(xmlString, fileName) {
  let response = {
    map: null,
    error: null
  };

  let parseString = require("xml2js").parseStringPromise;

  let xml;

  try {
    xml = await parseString(xmlString);
  } catch (err) {
    response.error = err;
    return response;
  }

  let parser;

  if (xml.AutoDrive) {
    parser = await import("./Adaptors/configSave");
  }

  if (xml.routeExport) {
    parser = await import("./Adaptors/routeExport");
  }

  if (!parser) {
    response.error = "File format not recognized";
    return response;
  }

  response.map = new Map(new parser.default(xml, fileName));

  return response;
}
