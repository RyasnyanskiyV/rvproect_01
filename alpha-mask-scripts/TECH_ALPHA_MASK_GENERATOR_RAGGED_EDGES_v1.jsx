(function TechAlphaMaskGenerator_RaggedEdges_v1(thisObj){
var SCRIPT_NAME = "TECH_ALPHA_MASK_GENERATOR_RAGGED_EDGES_v1";
var DEFAULT_NAME = "TECH_ALPHA_MASK_RAGGED";
var ORDER_PRESETS = ["Random", "Center Out", "Edges In", "Left To Right", "Right To Left", "Top Down", "Bottom Up", "Diagonal", "X Burst", "Quadrant Sweep", "Circuit Snake", "Glitch Clusters", "Flash Storm"];
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function safeNum(v, d){ return (isNaN(v) || v === null || v === undefined) ? d : v; }
function safeInt(v, d){ var n = parseInt(v, 10); return isNaN(n) ? d : n; }
function fmtNum(v){
v = safeNum(v, 0);
return String(Math.round(v * 1000000) / 1000000);
}
function fmtArr(a){
return "[" + fmtNum(a[0]) + "," + fmtNum(a[1]) + "]";
}
function findCompByName(name){
if(!app.project) return null;
for(var i = 1; i <= app.project.numItems; i++){
var it = app.project.item(i);
if(it instanceof CompItem && it.name === name) return it;
}
return null;
}
function removeItemsByName(name){
if(!app.project) return;
for(var i = app.project.numItems; i >= 1; i--){
var it = app.project.item(i);
if(it && it.name === name){
try{ it.remove(); }catch(e){}
}
}
}
function nextUniqueCompName(base){
var idx = 1;
while(idx < 9999){
var suffix = (idx < 10) ? ("0" + idx) : String(idx);
var n = base + "_" + suffix;
if(!findCompByName(n)) return n;
idx++;
}
return base + "_" + (new Date().getTime());
}
function randSeed(){
return Math.floor(Math.random() * 900000) + 100000;
}
function makeSeededRandom(seed){
var s = Math.max(1, Math.floor(seed) || 1);
return function(){
s = (s * 9301 + 49297) % 233280;
return s / 233280;
};
}
function seededShuffle(arr, seed){
var a = arr.slice(0);
var rnd = makeSeededRandom(seed);
for(var i = a.length - 1; i > 0; i--){
var j = Math.floor(rnd() * (i + 1));
var t = a[i]; a[i] = a[j]; a[j] = t;
}
return a;
}
function addSlider(layer, name, value){
try{
var fx = layer.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
fx.name = name;
try{ fx.property("ADBE Slider Control-0001").setValue(value); }
catch(e0){ try{ fx.property(1).setValue(value); }catch(e1){} }
return fx;
}catch(e){ return null; }
}
function addCheckbox(layer, name, value){
try{
var fx = layer.property("ADBE Effect Parade").addProperty("ADBE Checkbox Control");
fx.name = name;
try{ fx.property("ADBE Checkbox Control-0001").setValue(value ? 1 : 0); }
catch(e0){ try{ fx.property(1).setValue(value ? 1 : 0); }catch(e1){} }
return fx;
}catch(e){ return null; }
}
function makeEaseArrayForProperty(prop, influence){
var dims = 1;
try{
var v = prop.value;
if(v instanceof Array) dims = v.length;
}catch(e0){}
var arr = [];
for(var i = 0; i < dims; i++){
arr.push(new KeyframeEase(0, clamp(safeNum(influence, 55), 0.1, 100)));
}
return arr;
}
function setTechEase(prop, inInf, outInf){
try{
for(var k = 1; k <= prop.numKeys; k++){
try{ prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER); }catch(eI){}
try{ prop.setTemporalAutoBezierAtKey(k, false); }catch(eA){}
try{ prop.setTemporalContinuousAtKey(k, false); }catch(eC){}
try{ prop.setTemporalEaseAtKey(k, makeEaseArrayForProperty(prop, inInf), makeEaseArrayForProperty(prop, outInf)); }catch(eE){}
}
}catch(e){}
}
function setHoldInterpolation(prop){
try{
for(var k = 1; k <= prop.numKeys; k++){
try{ prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD); }catch(e){}
}
}catch(e0){}
}
function addRectLayer(comp, name, x, y, rw, rh, color, opacity){
var l = comp.layers.addShape();
l.name = name;
try{ l.label = 9; }catch(e0){}
var root = l.property("ADBE Root Vectors Group");
var grp = root.addProperty("ADBE Vector Group");
grp.name = "RECT";
var grpIndex = grp.propertyIndex;
var vectors = grp.property("ADBE Vectors Group");
var rect = vectors.addProperty("ADBE Vector Shape - Rect");
rect.property("ADBE Vector Rect Size").setValue([Math.max(1, rw), Math.max(1, rh)]);
try{ rect.property("ADBE Vector Rect Position").setValue([0, 0]); }catch(e1){}
try{ rect.property("ADBE Vector Rect Roundness").setValue(0); }catch(e2){}
grp = root.property(grpIndex);
vectors = grp.property("ADBE Vectors Group");
var fill = vectors.addProperty("ADBE Vector Graphic - Fill");
fill.property("ADBE Vector Fill Color").setValue(color || [1, 1, 1]);
try{ fill.property("ADBE Vector Fill Opacity").setValue(100); }catch(e3){}
var tr = l.property("ADBE Transform Group");
try{ tr.property("ADBE Anchor Point").setValue([0, 0]); }catch(e4){}
tr.property("ADBE Position").setValue([x, y]);
tr.property("ADBE Scale").setValue([100, 100]);
tr.property("ADBE Opacity").setValue(opacity === undefined ? 100 : opacity);
return l;
}
function addMarker(layer, t, comment){
try{ layer.property("Marker").setValueAtTime(t, new MarkerValue(comment)); }catch(e){}
}
function createControlLayer(comp, cfg, cellCount){
var ctrl = comp.layers.addNull();
ctrl.name = "CTRL_ALPHA_MASK";
try{ ctrl.label = 10; }catch(e0){}
var tr = ctrl.property("ADBE Transform Group");
try{ tr.property("ADBE Position").setValue([160, 120]); }catch(e1){}
try{ tr.property("ADBE Scale").setValue([80, 80]); }catch(e2){}
addSlider(ctrl, "Generated Reveal Seconds", cfg.revealDur);
addSlider(ctrl, "Generated Work Zone Seconds", cfg.holdDur);
addSlider(ctrl, "Generated Disappear Seconds", cfg.outDur);
addSlider(ctrl, "Generated Seed", cfg.seed);
addSlider(ctrl, "Rows", cfg.rows);
addSlider(ctrl, "Cols", cfg.cols);
addSlider(ctrl, "Final Mask Cells", cellCount);
addSlider(ctrl, "Original Mosaic Cells", safeInt(cfg.originalCellCount, cellCount));
addSlider(ctrl, "Ragged Edge Removed Cells", safeInt(cfg.raggedRemovedCells, 0));
addSlider(ctrl, "Ragged Edge Depth Percent", cfg.edgeDepthPct);
addSlider(ctrl, "Ragged Edge Roughness", cfg.edgeRoughness);
addSlider(ctrl, "Accent Layers", cfg.accentCount);
addSlider(ctrl, "Flicker Max Amount", 92);
addSlider(ctrl, "Flicker Rate", cfg.flickerRate);
addSlider(ctrl, "No Flicker Gap Seconds", 0.5);
addCheckbox(ctrl, "Transparent Alpha Output", true);
addMarker(ctrl, 0, "REVEAL_START");
addMarker(ctrl, cfg.revealDur, "WORK_ZONE_START");
addMarker(ctrl, cfg.revealDur + cfg.holdDur, "DISAPPEAR_START");
addMarker(ctrl, cfg.revealDur + cfg.holdDur + cfg.outDur, "OUT_END");
try{ ctrl.moveToBeginning(); }catch(e3){}
return ctrl;
}
function buildAxisSizes(total, count, rnd, variance){
var raw = [];
var sum = 0;
for(var i = 0; i < count; i++){
var wave = 0.72 + rnd() * 0.56;
var spike = (rnd() < 0.18) ? (0.55 + rnd() * 1.25) : 1.0;
var v = 1 + (wave * spike - 1) * variance;
raw.push(Math.max(0.18, v));
sum += raw[i];
}
var out = [];
var pxSum = 0;
for(i = 0; i < count; i++){
var size = (i === count - 1) ? (total - pxSum) : Math.round(total * raw[i] / sum);
if(size < 1) size = 1;
out.push(size);
pxSum += size;
}
return out;
}
function buildMosaic(areaLeft, areaTop, areaW, areaH, rows, cols, seed, presetName){
var preset = String(presetName || "Balanced Blocks");
var rnd = makeSeededRandom(Math.floor(seed) + rows * 97 + cols * 151);
var variance = 0.55;
if(preset === "Clean Mosaic") variance = 0.18;
if(preset === "Dense Circuit") variance = 0.38;
if(preset === "Aggressive Tech") variance = 0.78;
if(preset === "Wide Strips" || preset === "Tall Strips") variance = 0.62;
var colW = buildAxisSizes(areaW, cols, rnd, variance);
var rowH = buildAxisSizes(areaH, rows, rnd, variance);
var colX = [areaLeft];
var rowY = [areaTop];
var i, r, c;
for(i = 1; i < cols; i++) colX[i] = colX[i - 1] + colW[i - 1];
for(i = 1; i < rows; i++) rowY[i] = rowY[i - 1] + rowH[i - 1];
var occ = [];
for(r = 0; r < rows; r++){
occ[r] = [];
for(c = 0; c < cols; c++) occ[r][c] = false;
}
function canPlace(rr, cc, rs, cs){
if(rr + rs > rows || cc + cs > cols) return false;
for(var r2 = rr; r2 < rr + rs; r2++){
for(var c2 = cc; c2 < cc + cs; c2++){
if(occ[r2][c2]) return false;
}
}
return true;
}
function mark(rr, cc, rs, cs){
for(var r2 = rr; r2 < rr + rs; r2++){
for(var c2 = cc; c2 < cc + cs; c2++) occ[r2][c2] = true;
}
var x = colX[cc];
var y = rowY[rr];
var w = 0;
var h = 0;
for(var c3 = cc; c3 < cc + cs; c3++) w += colW[c3];
for(var r3 = rr; r3 < rr + rs; r3++) h += rowH[r3];
return {rr:rr, cc:cc, rs:rs, cs:cs, x:x, y:y, w:w, h:h, cx:x + w / 2, cy:y + h / 2};
}
function candidateList(){
if(preset === "Square Tech") return [[2,2], [3,3], [1,1], [2,1], [1,2], [4,4]];
if(preset === "Wide Strips") return [[1,3], [1,2], [1,4], [2,3], [1,1], [2,2]];
if(preset === "Tall Strips") return [[3,1], [2,1], [4,1], [3,2], [1,1], [2,2]];
if(preset === "Dense Circuit") return [[1,1], [1,2], [2,1], [2,2], [1,3], [3,1]];
if(preset === "Aggressive Tech") return [[2,3], [3,2], [1,4], [4,1], [2,2], [1,1], [3,3]];
return [[2,2], [1,2], [2,1], [1,3], [3,1], [1,1]];
}
var positions = [];
for(r = 0; r < rows; r++) for(c = 0; c < cols; c++) positions.push({r:r, c:c});
positions = seededShuffle(positions, Math.floor(seed) + 777);
var cells = [];
for(i = 0; i < positions.length; i++){
r = positions[i].r;
c = positions[i].c;
if(occ[r][c]) continue;
var candidates = seededShuffle(candidateList(), Math.floor(seed) + i * 31 + r * 13 + c * 17);
var placed = false;
for(var j = 0; j < candidates.length; j++){
var rs = candidates[j][0];
var cs = candidates[j][1];
if(canPlace(r, c, rs, cs)){
var preferSingle = (preset === "Dense Circuit") ? 0.34 : 0.16;
if(rs === 1 && cs === 1 && rnd() > preferSingle && j < candidates.length - 1) continue;
cells.push(mark(r, c, rs, cs));
placed = true;
break;
}
}
if(!placed && canPlace(r, c, 1, 1)) cells.push(mark(r, c, 1, 1));
}
return cells;
}
function buildRaggedProfile(count, maxDepth, roughness, rnd, cornerBias){
count = clamp(Math.round(count), 4, 160);
roughness = clamp(safeNum(roughness, 0.70), 0, 1);
var out = [];
var prev = maxDepth * (0.10 + rnd() * 0.28);
var step = Math.max(2, maxDepth / (5 + roughness * 14));
for(var i = 0; i < count; i++){
var t = (count <= 1) ? 0 : (i / (count - 1));
var edgeBoost = Math.pow(1 - Math.min(t, 1 - t) * 2, 1.35) * cornerBias;
var base = maxDepth * (0.08 + rnd() * (0.28 + roughness * 0.62));
if(rnd() < 0.18 + roughness * 0.30) base += maxDepth * (0.16 + rnd() * 0.46);
if(rnd() < roughness * 0.16) base = maxDepth * (0.02 + rnd() * 0.18);
base += maxDepth * edgeBoost * (0.28 + rnd() * 0.55);
var v = prev * (0.30 + (1 - roughness) * 0.36) + base * (0.70 - (1 - roughness) * 0.36);
v = Math.round(v / step) * step;
v = clamp(v, 0, maxDepth);
out.push(v);
prev = v;
}
return out;
}
function profileAt(profile, t){
if(!profile || profile.length < 1) return 0;
t = clamp(t, 0, 0.999999);
var idx = Math.floor(t * profile.length);
if(idx < 0) idx = 0;
if(idx >= profile.length) idx = profile.length - 1;
return profile[idx];
}
function applyRaggedEdges(cells, areaLeft, areaTop, areaW, areaH, cfg){
var depthPct = clamp(safeNum(cfg.edgeDepthPct, 7), 0, 35);
var roughness = clamp(safeNum(cfg.edgeRoughness, 0.72), 0, 1);
var maxDepth = Math.min(areaW, areaH) * depthPct / 100;
if(maxDepth < 2 || roughness <= 0.001) return cells;
var seed = safeInt(cfg.seed, 1);
var rnd = makeSeededRandom(seed + 88017);
var xSegs = clamp(Math.round(safeInt(cfg.cols, 14) * (1.15 + roughness * 1.55)), 8, 140);
var ySegs = clamp(Math.round(safeInt(cfg.rows, 8) * (1.35 + roughness * 1.80)), 8, 140);
var leftProfile = buildRaggedProfile(ySegs, maxDepth, roughness, rnd, 0.50);
var rightProfile = buildRaggedProfile(ySegs, maxDepth, roughness, rnd, 0.50);
var topProfile = buildRaggedProfile(xSegs, maxDepth, roughness, rnd, 0.42);
var bottomProfile = buildRaggedProfile(xSegs, maxDepth, roughness, rnd, 0.42);
var out = [];
var minSize = Math.max(2, Math.min(areaW, areaH) * 0.0012);
for(var i = 0; i < cells.length; i++){
var cell = cells[i];
var x1 = cell.x;
var y1 = cell.y;
var x2 = cell.x + cell.w;
var y2 = cell.y + cell.h;
var tx = (cell.cx - areaLeft) / Math.max(1, areaW);
var ty = (cell.cy - areaTop) / Math.max(1, areaH);
var leftEdge = areaLeft + profileAt(leftProfile, ty);
var rightEdge = areaLeft + areaW - profileAt(rightProfile, ty);
var topEdge = areaTop + profileAt(topProfile, tx);
var bottomEdge = areaTop + areaH - profileAt(bottomProfile, tx);
var nx1 = Math.max(x1, leftEdge);
var nx2 = Math.min(x2, rightEdge);
var ny1 = Math.max(y1, topEdge);
var ny2 = Math.min(y2, bottomEdge);
var nw = nx2 - nx1;
var nh = ny2 - ny1;
if(nw < minSize || nh < minSize) continue;
var nearOriginalEdge = (
cell.cx < areaLeft + maxDepth * 1.55 ||
cell.cx > areaLeft + areaW - maxDepth * 1.55 ||
cell.cy < areaTop + maxDepth * 1.55 ||
cell.cy > areaTop + areaH - maxDepth * 1.55
);
var clipped = (Math.abs(nx1 - x1) + Math.abs(nx2 - x2) + Math.abs(ny1 - y1) + Math.abs(ny2 - y2)) > 0.5;
var chipRnd = makeSeededRandom(seed + i * 1009 + 77123)();
var smallEnough = Math.max(nw, nh) < maxDepth * (1.55 + roughness);
if((nearOriginalEdge || clipped) && smallEnough && chipRnd < (0.035 + roughness * 0.115)) continue;
out.push({
rr: cell.rr,
cc: cell.cc,
rs: cell.rs,
cs: cell.cs,
x: nx1,
y: ny1,
w: nw,
h: nh,
cx: nx1 + nw / 2,
cy: ny1 + nh / 2
});
}
return out.length > 0 ? out : cells;
}
function orderCells(cells, seed, mode, areaLeft, areaTop, areaW, areaH){
var m = String(mode || "Random");
var cx = areaLeft + areaW / 2;
var cy = areaTop + areaH / 2;
var arr = [];
var i;
if(m === "Random"){
for(i = 0; i < cells.length; i++) arr.push(i);
return seededShuffle(arr, Math.floor(seed) + 901);
}
for(i = 0; i < cells.length; i++){
var cell = cells[i];
var dx = cell.cx - cx;
var dy = cell.cy - cy;
var score = 0;
if(m === "Center Out") score = Math.sqrt(dx * dx + dy * dy);
else if(m === "Edges In") score = -Math.min(cell.cx - areaLeft, cell.cy - areaTop, areaLeft + areaW - cell.cx, areaTop + areaH - cell.cy);
else if(m === "Left To Right") score = cell.cx;
else if(m === "Right To Left") score = -cell.cx;
else if(m === "Top Down") score = cell.cy;
else if(m === "Bottom Up") score = -cell.cy;
else if(m === "Diagonal") score = cell.cx + cell.cy;
else if(m === "X Burst"){
var nx = (cell.cx - areaLeft) / Math.max(1, areaW);
var ny = (cell.cy - areaTop) / Math.max(1, areaH);
score = Math.min(Math.abs(nx - ny), Math.abs(nx - (1 - ny))) * 1000 + Math.sqrt(dx * dx + dy * dy) * 0.18;
}
else if(m === "Quadrant Sweep"){
var q = (cell.cx < cx) ? ((cell.cy < cy) ? 0 : 3) : ((cell.cy < cy) ? 1 : 2);
score = q * 100000 + Math.sqrt(dx * dx + dy * dy);
}
else if(m === "Circuit Snake"){
score = cell.rr * 10000 + ((cell.rr % 2 === 0) ? cell.cx : -cell.cx);
}
else if(m === "Glitch Clusters"){
var gx = Math.floor(((cell.cx - areaLeft) / Math.max(1, areaW)) * 6);
var gy = Math.floor(((cell.cy - areaTop) / Math.max(1, areaH)) * 5);
var clusterRnd = makeSeededRandom(seed + gx * 101 + gy * 257)();
score = Math.floor(clusterRnd * 9) * 100000 + makeSeededRandom(seed + i * 37 + gx * 11 + gy * 17)() * 85000;
}
else if(m === "Flash Storm"){
score = Math.floor(makeSeededRandom(seed + i * 53 + cell.rr * 7)() * 12) * 100000 + makeSeededRandom(seed + i * 193 + cell.cc * 29)() * 95000;
}
else score = Math.sqrt(dx * dx + dy * dy);
arr.push({idx:i, score:score + (makeSeededRandom(seed + i * 19)() * 0.001)});
}
arr.sort(function(a, b){ return a.score - b.score; });
var out = [];
for(i = 0; i < arr.length; i++) out.push(arr[i].idx);
return out;
}
function rankMapFromOrder(order){
var map = {};
for(var i = 0; i < order.length; i++) map[order[i]] = i;
return map;
}
function burstStaggerTime(rank, total, windowDur, seed, phase){
var n = Math.max(1, total - 1);
var p = clamp(rank / n, 0, 1);
var rnd = makeSeededRandom(Math.floor(seed) + rank * 1009 + phase * 7919);
var burstCount = clamp(Math.round(Math.sqrt(total) * 1.35), 4, 18);
var bucket = Math.floor(p * burstCount);
if(bucket >= burstCount) bucket = burstCount - 1;
var bucketW = 1 / burstCount;
var shaped = (phase === 2) ? (1 - Math.pow(1 - p, 0.72)) : Math.pow(p, 0.78);
var anchor = bucket * bucketW;
var clusterPush = Math.pow(rnd(), 1.85) * bucketW * 0.78;
var jitter = (rnd() - 0.5) * bucketW * 0.62;
var curvePull = (shaped - p) * 0.22;
var glitchJump = (rnd() < 0.20) ? ((rnd() < 0.5 ? -1 : 1) * bucketW * (0.35 + rnd() * 0.95)) : 0;
return clamp((anchor + clusterPush + jitter + curvePull + glitchJump) * Math.max(0.001, windowDur), 0, Math.max(0.001, windowDur));
}
function addFlashKeys(op, t, width, hi, low){
if(t < 0) return;
width = Math.max(0.018, width);
try{
op.setValueAtTime(t, low);
op.setValueAtTime(t + width * 0.22, hi);
op.setValueAtTime(t + width * 0.50, low);
op.setValueAtTime(t + width * 0.74, hi * 0.62);
op.setValueAtTime(t + width, low);
}catch(e){}
}
function addDropoutKeys(op, t, width, low){
if(t < 0) return;
width = Math.max(0.018, width);
try{
op.setValueAtTime(t, 100);
op.setValueAtTime(t + width * 0.20, low);
op.setValueAtTime(t + width * 0.46, 100);
op.setValueAtTime(t + width * 0.68, Math.max(0, low * 0.42));
op.setValueAtTime(t + width, 100);
}catch(e){}
}
function markerTimingLines(inStartN, inDurN, outStartN, outDurN){
return [
'var ctrl=thisComp.layer("CTRL_ALPHA_MASK");',
'function clamp(v,a,b){return Math.max(a,Math.min(b,v));}',
'function smooth01(x){x=clamp(x,0,1);return x*x*(3-2*x);}',
'function mix(a,b,p){return a+(b-a)*p;}',
'function mtime(n,d){try{return ctrl.marker.key(n).time;}catch(e){return d;}}',
'function slider(n,d){try{return ctrl.effect(n)(1);}catch(e){return d;}}',
'var fd=Math.max(thisComp.frameDuration,0.001);',
'var rs=mtime("REVEAL_START",0);',
'var hs=mtime("WORK_ZONE_START",2);',
'var os=mtime("DISAPPEAR_START",4);',
'var oe=mtime("OUT_END",6);',
'if(hs<rs+fd) hs=rs+fd;',
'if(os<hs+fd) os=hs+fd;',
'if(oe<os+fd) oe=os+fd;',
'var rd=Math.max(fd,hs-rs);',
'var od=Math.max(fd,oe-os);',
'var inDur=clamp(rd*' + fmtNum(inDurN) + ',fd,rd);',
'var outDur=clamp(od*' + fmtNum(outDurN) + ',fd,od);',
'var t0=rs+' + fmtNum(inStartN) + '*Math.max(fd,rd-inDur);',
'var t1=Math.min(hs,t0+inDur);',
'var o0=os+' + fmtNum(outStartN) + '*Math.max(fd,od-outDur);',
'var o1=Math.min(oe,o0+outDur);',
'function edgeAmp(){',
'  if(time<rs || time>oe) return 0;',
'  var mid=(hs+os)*0.5;',
'  if(mid<hs+fd) mid=hs+fd;',
'  if(mid>os-fd) mid=os-fd;',
'  if(mid<=rs+fd || mid>=oe-fd) mid=(rs+oe)*0.5;',
'  var gap=clamp(slider("No Flicker Gap Seconds",0.5),0,Math.max(0,os-hs));',
'  var gapA=mid-gap*0.5;',
'  var gapB=mid+gap*0.5;',
'  if(gap>0 && time>=gapA && time<=gapB) return 0;',
'  var a=0;',
'  if(time<=mid){',
'    a=Math.pow(1-smooth01((time-rs)/Math.max(fd,gapA-rs)),0.38);',
'  }else{',
'    a=Math.pow(smooth01((time-gapB)/Math.max(fd,oe-gapB)),0.38);',
'  }',
'  return clamp(a,0,1);',
'}'
];
}
function makeOpacityExpression(inStartN, inDurN, outStartN, outDurN, seed, phase){
var lines = markerTimingLines(inStartN, inDurN, outStartN, outDurN);
lines.push(
'if(time<=rs+fd*0.5 || time>=oe-fd*1.25 || time<=t0 || time>=o1){',
'  0;',
'}else{',
'  var pIn=clamp((time-t0)/Math.max(fd,t1-t0),0,1);',
'  var pOut=clamp((time-o0)/Math.max(fd,o1-o0),0,1);',
'  var base=0;',
'  if(time<t1) base=100*smooth01(pIn);',
'  else if(time<o0) base=100;',
'  else base=100*(1-smooth01(pOut));',
'  var amp=edgeAmp()*clamp(slider("Flicker Max Amount",92)/100,0,2);',
'  var liveGate=smooth01((time-t0)/Math.max(fd*2,t1-t0))*smooth01((o1-time)/Math.max(fd*2,o1-o0));',
'  var rate=Math.max(1,slider("Flicker Rate",32));',
'  var tick=Math.floor(time*rate+' + fmtNum(phase) + ');',
'  seedRandom(' + fmtNum(seed) + '+tick*37,true);',
'  var a=random(-1,1);',
'  seedRandom(' + fmtNum(seed + 17) + '+tick*101,true);',
'  var b=(random()<0.66)?random(-1,1):random(-0.35,0.35);',
'  seedRandom(' + fmtNum(seed + 43) + '+tick*163,true);',
'  var c=(random()<0.22)?random(-1,1):0;',
'  var pulse=(a*0.42+b*0.90+c*1.25)*100*amp*liveGate;',
'  clamp(base+pulse,0,100);',
'}'
);
return lines.join("\n");
}
function makeScaleExpression(inStartN, inDurN, outStartN, outDurN, startScale, midScale, outScale, seed, phase){
var lines = markerTimingLines(inStartN, inDurN, outStartN, outDurN);
lines.push(
'var startS=' + fmtArr(startScale) + ';',
'var midS=' + fmtArr(midScale) + ';',
'var fullS=[100,100];',
'var outS=' + fmtArr(outScale) + ';',
'function mix2(a,b,p){return [mix(a[0],b[0],p),mix(a[1],b[1],p)];}',
'var pIn=smooth01((time-t0)/Math.max(fd,t1-t0));',
'var pOut=smooth01((time-o0)/Math.max(fd,o1-o0));',
'var s=startS;',
'if(time<t0) s=startS;',
'else if(time<t1){',
'  if(pIn<0.62) s=mix2(startS,midS,pIn/0.62);',
'  else s=mix2(midS,fullS,(pIn-0.62)/0.38);',
'}else if(time<o0) s=fullS;',
'else if(time<o1) s=mix2(fullS,outS,pOut);',
'else s=outS;',
'var amp=edgeAmp()*clamp(slider("Flicker Max Amount",92)/100,0,2);',
'var rate=Math.max(1,slider("Flicker Rate",32));',
'var tick=Math.floor(time*rate+' + fmtNum(phase) + ');',
'seedRandom(' + fmtNum(seed + 71) + '+tick*29,true);',
'var j=random(-5,5)*amp;',
'[s[0]+j,s[1]-j*0.45];'
);
return lines.join("\n");
}
function makePositionExpression(inStartN, inDurN, outStartN, outDurN, x, y, dx, dy, seed, phase){
var lines = markerTimingLines(inStartN, inDurN, outStartN, outDurN);
lines.push(
'var startP=' + fmtArr([x + dx, y + dy]) + ';',
'var fullP=' + fmtArr([x, y]) + ';',
'var outP=' + fmtArr([x - dx * 0.85, y - dy * 0.85]) + ';',
'function mix2(a,b,p){return [mix(a[0],b[0],p),mix(a[1],b[1],p)];}',
'var pIn=smooth01((time-t0)/Math.max(fd,t1-t0));',
'var pOut=smooth01((time-o0)/Math.max(fd,o1-o0));',
'var p=startP;',
'if(time<t0) p=startP;',
'else if(time<t1) p=mix2(startP,fullP,pIn);',
'else if(time<o0) p=fullP;',
'else if(time<o1) p=mix2(fullP,outP,pOut);',
'else p=outP;',
'var amp=edgeAmp()*clamp(slider("Flicker Max Amount",92)/100,0,2);',
'var rate=Math.max(1,slider("Flicker Rate",32));',
'var tick=Math.floor(time*rate+' + fmtNum(phase) + ');',
'seedRandom(' + fmtNum(seed + 131) + '+tick*19,true);',
'var jx=random(-2.5,2.5)*amp;',
'seedRandom(' + fmtNum(seed + 197) + '+tick*23,true);',
'var jy=random(-2.5,2.5)*amp;',
'[p[0]+jx,p[1]+jy];'
);
return lines.join("\n");
}
function accentMarkerLines(){
return [
'var ctrl=thisComp.layer("CTRL_ALPHA_MASK");',
'function clamp(v,a,b){return Math.max(a,Math.min(b,v));}',
'function smooth01(x){x=clamp(x,0,1);return x*x*(3-2*x);}',
'function mix(a,b,p){return a+(b-a)*p;}',
'function mtime(n,d){try{return ctrl.marker.key(n).time;}catch(e){return d;}}',
'var fd=Math.max(thisComp.frameDuration,0.001);',
'var rs=mtime("REVEAL_START",0);',
'var hs=mtime("WORK_ZONE_START",2);',
'var os=mtime("DISAPPEAR_START",4);',
'var oe=mtime("OUT_END",6);',
'if(hs<rs+fd) hs=rs+fd;',
'if(os<hs+fd) os=hs+fd;',
'if(oe<os+fd) oe=os+fd;',
'var rd=Math.max(fd,hs-rs);',
'var od=Math.max(fd,oe-os);'
];
}
function makeAccentOpacityExpression(inStartN, inEndN, outStartN, outEndN, maxOp, seed, phase){
var lines = accentMarkerLines();
lines.push(
'function pulse(a,b,m){if(time<a || time>b)return 0; var p=smooth01((time-a)/Math.max(fd,b-a)); return m*(1-Math.abs(p*2-1));}',
'var a0=rs+' + fmtNum(inStartN) + '*rd;',
'var a1=rs+' + fmtNum(inEndN) + '*rd;',
'var b0=os+' + fmtNum(outStartN) + '*od;',
'var b1=os+' + fmtNum(outEndN) + '*od;',
'if(time<=rs+fd*0.5 || time>=oe-fd*1.25){',
'  0;',
'}else{',
'  var v=Math.max(pulse(a0,a1,' + fmtNum(maxOp) + '),pulse(b0,b1,' + fmtNum(maxOp * 0.72) + '));',
'  seedRandom(' + fmtNum(seed) + '+Math.floor(time*36+' + fmtNum(phase) + ')*17,true);',
'  clamp(v*(0.72+random()*0.56),0,100);',
'}'
);
return lines.join("\n");
}
function makeAccentPositionExpression(inStartN, inEndN, outStartN, outEndN, p0, p1, p2, p3, seed, phase){
var lines = accentMarkerLines();
lines.push(
'function mix2(a,b,p){return [mix(a[0],b[0],p),mix(a[1],b[1],p)];}',
'var p0=' + fmtArr(p0) + ';',
'var p1=' + fmtArr(p1) + ';',
'var p2=' + fmtArr(p2) + ';',
'var p3=' + fmtArr(p3) + ';',
'var a0=rs+' + fmtNum(inStartN) + '*rd;',
'var a1=rs+' + fmtNum(inEndN) + '*rd;',
'var b0=os+' + fmtNum(outStartN) + '*od;',
'var b1=os+' + fmtNum(outEndN) + '*od;',
'var p=p1;',
'if(time>=a0 && time<=a1) p=mix2(p0,p1,smooth01((time-a0)/Math.max(fd,a1-a0)));',
'else if(time>=b0 && time<=b1) p=mix2(p2,p3,smooth01((time-b0)/Math.max(fd,b1-b0)));',
'seedRandom(' + fmtNum(seed + 5) + '+Math.floor(time*24+' + fmtNum(phase) + ')*13,true);',
'[p[0]+random(-1.5,1.5),p[1]+random(-1.5,1.5)];'
);
return lines.join("\n");
}
function animateMaskCell(layer, x, y, buildW, buildH, rank, outRank, total, cfg, rnd){
var revealDur = Math.max(0.05, cfg.revealDur);
var outDur = Math.max(0.05, cfg.outDur);
var cellBuild = clamp(cfg.cellBuild * (0.72 + rnd() * 0.70), 0.045, Math.max(0.045, revealDur * 0.80));
var cellOut = clamp(cfg.cellBuild * (0.58 + rnd() * 0.55), 0.04, Math.max(0.04, outDur * 0.72));
var inStartN = burstStaggerTime(rank, total, 1, cfg.seed, 1);
var outStartN = burstStaggerTime(outRank, total, 1, cfg.seed + 4321, 2);
var inDurN = clamp(cellBuild / revealDur, 0.018, 0.78);
var outDurN = clamp(cellOut / outDur, 0.018, 0.78);
var axisRand = rnd();
var mode = (axisRand < 0.34) ? "H" : ((axisRand < 0.68) ? "V" : "B");
var dx = (rnd() - 0.5) * Math.min(28, Math.max(3, buildW * 0.035));
var dy = (rnd() - 0.5) * Math.min(28, Math.max(3, buildH * 0.035));
var tr = layer.property("ADBE Transform Group");
var op = tr.property("ADBE Opacity");
var sc = tr.property("ADBE Scale");
var pos = tr.property("ADBE Position");
var startScale = [100, 100];
var midScale = [100, 100];
var outScale = [100, 100];
if(mode === "H"){
startScale = [2, 100];
midScale = [110, 100];
outScale = [4, 100];
}else if(mode === "V"){
startScale = [100, 2];
midScale = [100, 110];
outScale = [100, 4];
}else{
startScale = [8, 8];
midScale = [106, 106];
outScale = [12, 12];
}
var exprSeed = Math.floor(cfg.seed) + rank * 181 + outRank * 977 + total * 13;
var phase = rnd() * 1000;
op.setValue(0);
sc.setValue(startScale);
pos.setValue([x + dx, y + dy]);
op.expression = makeOpacityExpression(inStartN, inDurN, outStartN, outDurN, exprSeed, phase);
sc.expression = makeScaleExpression(inStartN, inDurN, outStartN, outDurN, startScale, midScale, outScale, exprSeed, phase + 11.3);
pos.expression = makePositionExpression(inStartN, inDurN, outStartN, outDurN, x, y, dx, dy, exprSeed, phase + 29.7);
}
function addAccentBars(comp, cfg, areaLeft, areaTop, areaW, areaH){
var count = clamp(safeInt(cfg.accentCount, 24), 0, 120);
var rnd = makeSeededRandom(Math.floor(cfg.seed) + 45001);
var white = [1, 1, 1];
var revealDur = cfg.revealDur;
var holdDur = cfg.holdDur;
var outDur = cfg.outDur;
var outStartBase = revealDur + holdDur;
var compEnd = revealDur + holdDur + outDur;
for(var i = 0; i < count; i++){
var horizontal = rnd() < 0.58;
var longSide = horizontal ? areaW * (0.16 + rnd() * 0.58) : areaH * (0.16 + rnd() * 0.58);
var thinSide = 1 + Math.floor(rnd() * 5);
var rw = horizontal ? longSide : thinSide;
var rh = horizontal ? thinSide : longSide;
var x = areaLeft + rnd() * areaW;
var y = areaTop + rnd() * areaH;
var l = addRectLayer(comp, "TECH_ALPHA_SCAN_" + (i + 1), x, y, rw, rh, white, 0);
try{ l.label = 8; }catch(e0){}
var inStart = rnd() * Math.max(0.04, revealDur * 0.78);
var inEnd = Math.min(revealDur, inStart + 0.055 + rnd() * 0.20);
var outStart = outStartBase + rnd() * Math.max(0.04, outDur * 0.74);
var outEnd = Math.min(compEnd, outStart + 0.05 + rnd() * 0.18);
var op = l.property("ADBE Transform Group").property("ADBE Opacity");
var maxOp = 20 + rnd() * 62;
op.setValueAtTime(0, 0);
op.setValueAtTime(inStart, 0);
op.setValueAtTime(inStart + Math.max(0.012, (inEnd - inStart) * 0.24), maxOp);
op.setValueAtTime(inEnd, 0);
op.setValueAtTime(outStart, 0);
op.setValueAtTime(outStart + Math.max(0.012, (outEnd - outStart) * 0.28), maxOp * 0.72);
op.setValueAtTime(outEnd, 0);
op.setValueAtTime(compEnd, 0);
setHoldInterpolation(op);
var pos = l.property("ADBE Transform Group").property("ADBE Position");
var drift = horizontal ? [12 + rnd() * 38, 0] : [0, 12 + rnd() * 38];
if(rnd() < 0.5){ drift[0] = -drift[0]; drift[1] = -drift[1]; }
pos.setValueAtTime(inStart, [x - drift[0], y - drift[1]]);
pos.setValueAtTime(inEnd, [x + drift[0], y + drift[1]]);
pos.setValueAtTime(outStart, [x + drift[0] * 0.4, y + drift[1] * 0.4]);
pos.setValueAtTime(outEnd, [x - drift[0] * 0.6, y - drift[1] * 0.6]);
setTechEase(pos, 65, 20);
var rDur = Math.max(0.001, revealDur);
var oDur = Math.max(0.001, outDur);
var accentSeed = Math.floor(cfg.seed) + i * 643 + 9001;
op.expression = makeAccentOpacityExpression(
inStart / rDur,
inEnd / rDur,
(outStart - outStartBase) / oDur,
(outEnd - outStartBase) / oDur,
maxOp,
accentSeed,
rnd() * 1000
);
pos.expression = makeAccentPositionExpression(
inStart / rDur,
inEnd / rDur,
(outStart - outStartBase) / oDur,
(outEnd - outStartBase) / oDur,
[x - drift[0], y - drift[1]],
[x + drift[0], y + drift[1]],
[x + drift[0] * 0.4, y + drift[1] * 0.4],
[x - drift[0] * 0.6, y - drift[1] * 0.6],
accentSeed,
rnd() * 1000
);
}
}
function buildAlphaMask(cfg, statusText){
app.beginUndoGroup(SCRIPT_NAME);
try{
if(!app.project) app.newProject();
var w = clamp(safeInt(cfg.width, 3840), 128, 8192);
var h = clamp(safeInt(cfg.height, 2160), 128, 8192);
var fps = clamp(safeNum(cfg.fps, 30), 1, 120);
var revealDur = clamp(safeNum(cfg.revealDur, 2), 0.10, 60);
var holdDur = clamp(safeNum(cfg.holdDur, 2), 0, 120);
var outDur = clamp(safeNum(cfg.outDur, 2), 0.10, 60);
var dur = revealDur + holdDur + outDur;
cfg.width = w;
cfg.height = h;
cfg.fps = fps;
cfg.revealDur = revealDur;
cfg.holdDur = holdDur;
cfg.outDur = outDur;
cfg.rows = clamp(safeInt(cfg.rows, 8), 2, 40);
cfg.cols = clamp(safeInt(cfg.cols, 14), 2, 60);
cfg.cellBuild = clamp(safeNum(cfg.cellBuild, 0.18), 0.03, Math.max(0.04, revealDur * 0.85));
cfg.accentCount = clamp(safeInt(cfg.accentCount, 24), 0, 120);
cfg.flickerRate = clamp(safeNum(cfg.flickerRate, 32), 1, 120);
cfg.edgeDepthPct = clamp(safeNum(cfg.edgeDepthPct, 7), 0, 35);
cfg.edgeRoughness = clamp(safeNum(cfg.edgeRoughness, 0.72), 0, 1);
cfg.seed = safeInt(cfg.seed, randSeed());
cfg.revealPreset = cfg.revealPreset || "Center Out";
cfg.outPreset = cfg.outPreset || "Edges In";
var baseName = cfg.compName || DEFAULT_NAME;
var compName = cfg.createNew ? nextUniqueCompName(baseName) : baseName;
if(!cfg.createNew) removeItemsByName(compName);
var comp = app.project.items.addComp(compName, w, h, 1, dur, fps);
comp.bgColor = [0, 0, 0];
var pad = Math.max(2, Math.round(Math.min(w, h) * 0.002));
var areaLeft = -pad;
var areaTop = -pad;
var areaW = w + pad * 2;
var areaH = h + pad * 2;
var cells = buildMosaic(areaLeft, areaTop, areaW, areaH, cfg.rows, cfg.cols, cfg.seed, cfg.layoutPreset);
var originalCellCount = cells.length;
cells = applyRaggedEdges(cells, areaLeft, areaTop, areaW, areaH, cfg);
cfg.originalCellCount = originalCellCount;
cfg.raggedRemovedCells = Math.max(0, originalCellCount - cells.length);
var revealOrder = orderCells(cells, cfg.seed, cfg.revealPreset, areaLeft, areaTop, areaW, areaH);
var outOrder = orderCells(cells, cfg.seed + 4321, cfg.outPreset || "Edges In", areaLeft, areaTop, areaW, areaH);
if(cfg.reverseOut) outOrder = outOrder.slice(0).reverse();
var revealRanks = rankMapFromOrder(revealOrder);
var outRanks = rankMapFromOrder(outOrder);
var ctrl = createControlLayer(comp, cfg, cells.length);
addAccentBars(comp, cfg, areaLeft, areaTop, areaW, areaH);
var white = [1, 1, 1];
var rnd = makeSeededRandom(Math.floor(cfg.seed) + 16001);
for(var i = 0; i < cells.length; i++){
var cell = cells[i];
var over = pad + 1;
var rw = Math.max(1, cell.w + over * 2);
var rh = Math.max(1, cell.h + over * 2);
var x = cell.cx;
var y = cell.cy;
var layer = addRectLayer(comp, "ALPHA_CELL_" + (i + 1), x, y, rw, rh, white, 0);
animateMaskCell(layer, x, y, rw, rh, revealRanks[i], outRanks[i], cells.length, cfg, rnd);
}
try{ ctrl.moveToBeginning(); }catch(eMove){}
try{ comp.openInViewer(); }catch(eView){}
if(statusText){
statusText.text = "Done: " + compName + " / ragged edge " + cfg.edgeDepthPct + "% / " + w + "x" + h + " / " + cells.length + " cells / in " + cfg.revealPreset + " / out " + cfg.outPreset + " / seed " + cfg.seed;
}
}catch(err){
if(statusText) statusText.text = "Error: " + err.toString();
alert("Error: " + err.toString());
}finally{
app.endUndoGroup();
}
}
function parseSizePreset(text){
var s = String(text || "");
if(s === "1920 x 1080") return [1920, 1080];
if(s === "3840 x 2160") return [3840, 2160];
if(s === "1080 x 1920") return [1080, 1920];
if(s === "2160 x 3840") return [2160, 3840];
if(s === "2160 x 2160") return [2160, 2160];
if(s === "4096 x 2160") return [4096, 2160];
return null;
}
function buildUI(thisObj){
var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", SCRIPT_NAME, undefined, {resizeable:true});
if(!pal) return pal;
pal.orientation = "column";
pal.alignChildren = ["fill", "top"];
pal.spacing = 6;
pal.margins = 8;
var pComp = pal.add("panel", undefined, "Comp / Alpha Output");
pComp.orientation = "column";
pComp.alignChildren = ["fill", "top"];
pComp.margins = 10;
var rowName = pComp.add("group");
rowName.add("statictext", undefined, "Name");
var eName = rowName.add("edittext", undefined, DEFAULT_NAME);
eName.characters = 24;
var rowSizePreset = pComp.add("group");
rowSizePreset.add("statictext", undefined, "Size");
var ddSize = rowSizePreset.add("dropdownlist", undefined, ["Custom", "1920 x 1080", "3840 x 2160", "1080 x 1920", "2160 x 3840", "2160 x 2160", "4096 x 2160"]);
ddSize.selection = 2;
var rowDims = pComp.add("group");
rowDims.add("statictext", undefined, "W");
var eW = rowDims.add("edittext", undefined, "3840");
eW.characters = 6;
rowDims.add("statictext", undefined, "H");
var eH = rowDims.add("edittext", undefined, "2160");
eH.characters = 6;
rowDims.add("statictext", undefined, "FPS");
var eFps = rowDims.add("edittext", undefined, "30");
eFps.characters = 4;
var pTiming = pal.add("panel", undefined, "Timing");
pTiming.orientation = "column";
pTiming.alignChildren = ["fill", "top"];
pTiming.margins = 10;
var rowTiming = pTiming.add("group");
rowTiming.add("statictext", undefined, "Reveal");
var eReveal = rowTiming.add("edittext", undefined, "2.0");
eReveal.characters = 5;
rowTiming.add("statictext", undefined, "Work");
var eHold = rowTiming.add("edittext", undefined, "2.0");
eHold.characters = 5;
rowTiming.add("statictext", undefined, "Out");
var eOut = rowTiming.add("edittext", undefined, "2.0");
eOut.characters = 5;
var pLayout = pal.add("panel", undefined, "Tech Mosaic");
pLayout.orientation = "column";
pLayout.alignChildren = ["fill", "top"];
pLayout.margins = 10;
var rowGrid = pLayout.add("group");
rowGrid.add("statictext", undefined, "Rows");
var eRows = rowGrid.add("edittext", undefined, "8");
eRows.characters = 4;
rowGrid.add("statictext", undefined, "Cols");
var eCols = rowGrid.add("edittext", undefined, "14");
eCols.characters = 4;
rowGrid.add("statictext", undefined, "Cell Build");
var eCellBuild = rowGrid.add("edittext", undefined, "0.18");
eCellBuild.characters = 5;
var rowPreset = pLayout.add("group");
rowPreset.add("statictext", undefined, "Blocks");
var ddLayout = rowPreset.add("dropdownlist", undefined, ["Balanced Blocks", "Square Tech", "Wide Strips", "Tall Strips", "Dense Circuit", "Aggressive Tech", "Clean Mosaic"]);
ddLayout.selection = 0;
var rowReveal = pLayout.add("group");
rowReveal.add("statictext", undefined, "Reveal");
var ddReveal = rowReveal.add("dropdownlist", undefined, ORDER_PRESETS);
ddReveal.selection = 1;
var rowOutPreset = pLayout.add("group");
rowOutPreset.add("statictext", undefined, "Out");
var ddOut = rowOutPreset.add("dropdownlist", undefined, ORDER_PRESETS);
ddOut.selection = 2;
var rowAccents = pLayout.add("group");
rowAccents.add("statictext", undefined, "Scan Accents");
var eAccents = rowAccents.add("edittext", undefined, "24");
eAccents.characters = 5;
var rowFlicker = pLayout.add("group");
rowFlicker.add("statictext", undefined, "Flicker Rate");
var eFlickerRate = rowFlicker.add("edittext", undefined, "32");
eFlickerRate.characters = 5;
var rowEdge = pLayout.add("group");
rowEdge.add("statictext", undefined, "Edge Depth %");
var eEdgeDepth = rowEdge.add("edittext", undefined, "7");
eEdgeDepth.characters = 5;
rowEdge.add("statictext", undefined, "Rough");
var eEdgeRoughness = rowEdge.add("edittext", undefined, "0.72");
eEdgeRoughness.characters = 5;
var pOptions = pal.add("panel", undefined, "Options");
pOptions.orientation = "column";
pOptions.alignChildren = ["fill", "top"];
pOptions.margins = 10;
var cbNew = pOptions.add("checkbox", undefined, "Create new comp on each build");
cbNew.value = true;
var cbRandomEvery = pOptions.add("checkbox", undefined, "New random seed every build");
cbRandomEvery.value = true;
var cbReverseOut = pOptions.add("checkbox", undefined, "Reverse selected Out preset");
cbReverseOut.value = false;
var cbRandomSize = pOptions.add("checkbox", undefined, "Random size preset when pressing New Random");
cbRandomSize.value = false;
var tips = pal.add("statictext", undefined, "Ragged version: final alpha keeps a broken blocky perimeter. Render with RGB+Alpha or Alpha Only.", {multiline:true});
tips.maximumSize.height = 44;
var btnRow = pal.add("group");
var btnGenerate = btnRow.add("button", undefined, "Generate Ragged Mask");
var btnRandom = btnRow.add("button", undefined, "New Random Ragged");
var btnClose = btnRow.add("button", undefined, "Close");
var statusText = pal.add("statictext", undefined, "Ready.", {multiline:true});
statusText.maximumSize.height = 44;
var hiddenSeed = randSeed();
function applyPresetToFields(){
var preset = ddSize.selection ? ddSize.selection.text : "Custom";
var wh = parseSizePreset(preset);
if(wh){
eW.text = String(wh[0]);
eH.text = String(wh[1]);
}
}
function randomizeControls(){
hiddenSeed = randSeed();
var rnd = makeSeededRandom(hiddenSeed);
eRows.text = String(5 + Math.floor(rnd() * 7));
eCols.text = String(8 + Math.floor(rnd() * 11));
eCellBuild.text = (0.11 + rnd() * 0.17).toFixed(2);
eAccents.text = String(12 + Math.floor(rnd() * 36));
eFlickerRate.text = String(18 + Math.floor(rnd() * 45));
eEdgeDepth.text = (4 + rnd() * 9).toFixed(1);
eEdgeRoughness.text = (0.48 + rnd() * 0.46).toFixed(2);
ddLayout.selection = Math.floor(rnd() * ddLayout.items.length);
var revealIndex = Math.floor(rnd() * ddReveal.items.length);
var outIndex = Math.floor(rnd() * ddOut.items.length);
if(outIndex === revealIndex && ddOut.items.length > 1) outIndex = (outIndex + 1) % ddOut.items.length;
ddReveal.selection = revealIndex;
ddOut.selection = outIndex;
if(cbRandomSize.value){
ddSize.selection = 1 + Math.floor(rnd() * (ddSize.items.length - 1));
applyPresetToFields();
}
}
function collectCfg(){
return {
compName: eName.text || DEFAULT_NAME,
width: safeInt(eW.text, 3840),
height: safeInt(eH.text, 2160),
fps: safeNum(parseFloat(eFps.text), 30),
revealDur: safeNum(parseFloat(eReveal.text), 2),
holdDur: safeNum(parseFloat(eHold.text), 2),
outDur: safeNum(parseFloat(eOut.text), 2),
rows: safeInt(eRows.text, 8),
cols: safeInt(eCols.text, 14),
cellBuild: safeNum(parseFloat(eCellBuild.text), 0.18),
accentCount: safeInt(eAccents.text, 24),
flickerRate: safeNum(parseFloat(eFlickerRate.text), 32),
edgeDepthPct: safeNum(parseFloat(eEdgeDepth.text), 7),
edgeRoughness: safeNum(parseFloat(eEdgeRoughness.text), 0.72),
layoutPreset: ddLayout.selection ? ddLayout.selection.text : "Balanced Blocks",
revealPreset: ddReveal.selection ? ddReveal.selection.text : "Center Out",
outPreset: ddOut.selection ? ddOut.selection.text : "Edges In",
createNew: cbNew.value,
reverseOut: cbReverseOut.value,
seed: hiddenSeed
};
}
ddSize.onChange = function(){
applyPresetToFields();
};
btnGenerate.onClick = function(){
if(cbRandomEvery.value) hiddenSeed = randSeed();
statusText.text = "Building alpha mask...";
buildAlphaMask(collectCfg(), statusText);
};
btnRandom.onClick = function(){
randomizeControls();
statusText.text = "Building new random alpha mask...";
buildAlphaMask(collectCfg(), statusText);
};
btnClose.onClick = function(){ try{ pal.close(); }catch(e){} };
pal.onResizing = pal.onResize = function(){ this.layout.resize(); };
pal.layout.layout(true);
return pal;
}
var pal = buildUI(thisObj);
if(pal instanceof Window){ pal.center(); pal.show(); }
else{ pal.layout.layout(true); pal.layout.resize(); }
})(this);
