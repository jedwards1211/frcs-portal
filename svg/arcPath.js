'use strict';

export default function arcPath(center, radius, thickness, startAngle, angularSpan) {
  var sfrom = Math.sin(startAngle),
      cfrom = Math.cos(startAngle),
      sto   = Math.sin(startAngle + angularSpan),
      cto   = Math.cos(startAngle + angularSpan);

  var large = Math.abs(angularSpan) > Math.PI ? 1 : 0,
      cw    = angularSpan >= 0;

  var p0 = (center[0] + cfrom * radius[0]) + ',' + (center[1] - sfrom  * radius[1]);
  var p1 = (center[0] + cto   * radius[0]) + ',' + (center[1] - sto    * radius[1]);
  var p2 = (center[0] + cto   * (radius[0] - thickness)) + ',' + (center[1] - sto   * (radius[1] - thickness));
  var p3 = (center[0] + cfrom * (radius[0] - thickness)) + ',' + (center[1] - sfrom * (radius[1] - thickness));
  var r0 = radius[0] + ',' + radius[1];
  var r1 = (radius[0] - thickness) + ',' + (radius[1] - thickness);
  var flags0 = large + ',' + (cw ? 0 : 1);
  var flags1 = large + ',' + (cw ? 1 : 0);
  
  return  `M${p0} A${r0} 0 ${flags0} ${p1} L${p2} A${r1} 0 ${flags1} ${p3} L${p0}`;
}
