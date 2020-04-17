export function closestPointToLine(p, a, b) {
  // https://jsfiddle.net/soulwire/UA6H5/
  var atob = { x: b.x - a.x, z: b.z - a.z };
  var atop = { x: p.x - a.x, z: p.z - a.z };
  var len = atob.x * atob.x + atob.z * atob.z;
  var dot = atop.x * atob.x + atop.z * atob.z;
  var t = Math.min(1, Math.max(0, dot / len));

  if (t === 0.0 || t === 1.0) {
      // do not move if out of the line
    return;
  }

  return {
    x: a.x + atob.x * t,
    z: a.z + atob.z * t,
  };
}
