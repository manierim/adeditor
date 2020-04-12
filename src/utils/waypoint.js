export default class Waypoint {
  map;
  index;
  x;
  y;
  z;
  marker;
  ins;
  outs;

  constructor(map, index, x, y, z, ins, outs) {
    this.map = map;
    this.index = parseInt(index);
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.z = parseFloat(z);
    this.marker = null;

    this.ins = ins;
    this.outs = outs;

    this.paths = [];
  }

  inFromOuts() {
    if (this.map.cache["inFromOuts"] === undefined) {
      this.map.cache["inFromOuts"] = {};
      this.map.waypointsArray().forEach(wpt => {
        if (!this.map.cache["inFromOuts"][wpt.index]) {
          this.map.cache["inFromOuts"][wpt.index] = [];
        }
        wpt.existingOuts().forEach(targetIndex => {
          if (!this.map.cache["inFromOuts"][targetIndex]) {
            this.map.cache["inFromOuts"][targetIndex] = [];
          }
          this.map.cache["inFromOuts"][targetIndex].push(wpt.index);
        });
      });
    }
    return this.map.cache["inFromOuts"];
  }

  _cache_check() {
    if (this.map.cache["wpts"] === undefined) {
      this.map.cache["wpts"] = {};
    }
    if (this.map.cache["wpts"][this.index] === undefined) {
      this.map.cache["wpts"][this.index] = {};
    }
  }

  set(key, value) {
    this._cache_check();
    this.map.cache["wpts"][this.index][key] = value;
  }

  get(key, def) {
    this._cache_check();
    if (this.map.cache["wpts"][this.index][key] !== undefined) {
      return this.map.cache["wpts"][this.index][key];
    }
    return def;
  }

  linksofType(linkType) {
    let linksofType = this.get("linksofType");
    if (linksofType === undefined) {
      linksofType = {};
      ["in", "out", "bidirectional", "reverse-in", "reverse-out"].forEach(
        linkType => {
          linksofType[linkType] = this.linkedWpts().filter(
            linkedNodeIndex => this.linkType(linkedNodeIndex) === linkType
          );
        }
      );
      this.set("linksofType", linksofType);
    }

    if (linkType !== undefined) {
      return linksofType[linkType];
    }
    return linksofType;
  }

  existingIns() {
    let existingIns = this.get("existingIns");
    if (existingIns === undefined) {
      existingIns = this.ins.filter(idx => this.map.waypoints[idx]);
      this.set("existingIns", existingIns);
    }
    return existingIns;
  }

  existingOuts() {
    let existingOuts = this.get("existingOuts");
    if (existingOuts === undefined) {
      existingOuts = this.outs.filter(idx => this.map.waypoints[idx]);
      this.set("existingOuts", existingOuts);
    }
    return existingOuts;
  }

  linkType(targetIndex) {
    let cacheKey = "linkType-" + targetIndex;
    let linkType = this.get(cacheKey);
    if (linkType === undefined) {
      linkType = null;

      if (this.linkedWpts().indexOf(targetIndex) !== -1) {
        linkType = "in";
        if (
          this.existingOuts().indexOf(targetIndex) !== -1 &&
          this.existingIns().indexOf(targetIndex) !== -1
        ) {
          linkType = "bidirectional";
        } else if (
          this.existingIns().indexOf(targetIndex) !== -1 &&
          this.map.waypoints[targetIndex].existingOuts().indexOf(this.index) !==
            -1
        ) {
          linkType = "in";
        } else if (
          this.existingOuts().indexOf(targetIndex) !== -1 &&
          this.map.waypoints[targetIndex].existingIns().indexOf(this.index) !==
            -1
        ) {
          linkType = "out";
        } else if (this.existingOuts().indexOf(targetIndex) !== -1) {
          linkType = "reverse-out";
        } else {
          linkType = "reverse-in";
        }
      }

      this.set(cacheKey, linkType);
    }
    return linkType;
  }

  isNode() {
    let isNode = this.get("isNode");
    if (isNode === undefined) {
      isNode = true;
      let linkedWpts = this.linkedWpts();
      if (linkedWpts.length === 2) {
        isNode = !(
          // standard in -> out
          (
            (this.linkType(linkedWpts[0]) === "in" &&
              this.linkType(linkedWpts[1]) === "out") ||
            // standard out -> in
            (this.linkType(linkedWpts[0]) === "out" &&
              this.linkType(linkedWpts[1]) === "in") ||
            // reverse out -> in
            (this.linkType(linkedWpts[0]) === "reverse-out" &&
              this.linkType(linkedWpts[1]) === "reverse-in") ||
            // reverse in -> out
            (this.linkType(linkedWpts[0]) === "reverse-in" &&
              this.linkType(linkedWpts[1]) === "reverse-out") ||
            // bidirectional
            (this.linkType(linkedWpts[0]) === "bidirectional" &&
              this.linkType(linkedWpts[1]) === "bidirectional")
          )
        );
      }
      this.set("isNode", isNode);
    }
    return isNode;
  }

  linkedWpts() {
    let linkedWpts = this.get("linkedWpts");

    if (linkedWpts === undefined) {
      linkedWpts = [
        ...new Set([
          ...this.existingIns(),
          ...this.existingOuts(),
          ...this.inFromOuts()[this.index]
        ])
      ];
      this.set("linkedWpts", linkedWpts);
    }
    return linkedWpts;
  }

  addPath(pathIndex) {
    this.paths.push(pathIndex);
  }
}
