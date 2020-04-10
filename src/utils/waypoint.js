export default class Waypoint {
  constructor(map, index, x, y, z) {
    this.map = map;
    this.index = index;
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.z = parseFloat(z);
    this.marker = null;
    this.links = {};
    this.paths = [];
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

  addLinkToWpt(toNodeIndex, isOut) {
    this.set("linksofType", null);
    if (this.links[toNodeIndex] === undefined) {
      this.links[toNodeIndex] = isOut;
      return;
    }

    if (this.links[toNodeIndex] === null || this.links[toNodeIndex] === isOut) {
      return;
    }

    this.links[toNodeIndex] = null;
  }

  linksofType(linkType) {
    let linksofType = this.get("linksofType");
    if (!linksofType) {
      linksofType = {};
      [false, true, null].forEach((linkType) => {
        linksofType[linkType] = this.linkedWpts().filter(
          (linkedNodeIndex) => this.linktoWptIsOut(linkedNodeIndex) === linkType
        );
      });
      this.set("linksofType", linksofType);
    }

    if (linkType !== undefined) {
      return linksofType[linkType];
    }
    return linksofType;
  }

  isNode() {
    if (!this.linkedWpts().length) {
      return false;
    }
    let linksofType = this.linksofType();
    return !(
      this.linkedWpts().length === 2 &&
      (linksofType[null].length === 2 ||
        (linksofType[false].length === 1 && linksofType[true].length === 1))
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
