import { BLOCK_WIDTH, type RibbonLayout } from "./ribbonLayout";

/*
 * The glass piece seen straight on, as SVG: what the orthographic camera shows
 * at yaw 0 and pitch 0. The site renders it at build time, so the graph is
 * there before three.js loads, and it stays the picture wherever WebGL is
 * missing. The canvas fades in over it at the same view and then turns into
 * the app's three-quarter view, so the two have to agree to the pixel: the
 * centring and the camera frame below repeat glassScene.ts.
 */

/** The collar's tube radius, from glassScene.ts. */
const COLLAR_RADIUS = 0.05;
/** How far a ribbon's dark edge lines reach past it, and which ribbons get them. */
const EDGE_REACH = 0.014 * 1.4;
const EDGED_THICKNESS = 0.08;
/** The camera frame's floor, from the stage defaults. */
const MIN_HALF_WIDTH = 4.4;
const MIN_HALF_HEIGHT = 2.5;

export type FrontRibbon = { d: string; kind: "known" | "estimated" | "fee" | "feeEstimated" };
export type FrontBlock = { x: number; y: number; width: number; height: number; owned: boolean };

export type FrontView = {
  /** SVG viewBox in scene units, y flipped so up is up. */
  viewBox: string;
  ribbons: FrontRibbon[];
  blocks: FrontBlock[];
  collar: { x: number; y: number; width: number; height: number };
};

const r = (n: number) => Math.round(n * 1000) / 1000;

/** The ribbon's outline at depth zero: the centreline offset by half its width. */
function outline(points: Array<[number, number]>, thickness: number) {
  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];
  points.forEach(([x, y], index) => {
    const [ax, ay] = points[Math.max(0, index - 1)];
    const [bx, by] = points[Math.min(points.length - 1, index + 1)];
    const length = Math.hypot(bx - ax, by - ay) || 1;
    const nx = (-(by - ay) / length) * (thickness / 2);
    const ny = ((bx - ax) / length) * (thickness / 2);
    left.push([x + nx, y + ny]);
    right.push([x - nx, y - ny]);
  });
  return [...left, ...right.reverse()];
}

export function frontView(layout: RibbonLayout): FrontView {
  const outlines = layout.ribbons.map((ribbon) => ({
    ribbon,
    shape: outline(ribbon.points, ribbon.thickness),
  }));
  const blocks = layout.legs.map((leg) => ({
    x: leg.x - BLOCK_WIDTH / 2,
    y: leg.y - leg.height / 2,
    width: BLOCK_WIDTH,
    height: leg.height,
    owned: leg.owned,
  }));
  const collarHalf = layout.center.halfHeight + COLLAR_RADIUS;

  // The stage centres the content's bounding box on the pivot.
  let minX = -COLLAR_RADIUS;
  let maxX = COLLAR_RADIUS;
  let minY = -collarHalf;
  let maxY = collarHalf;
  for (const { ribbon } of outlines) {
    const edged = !ribbon.fee && ribbon.thickness >= EDGED_THICKNESS;
    const reach = edged ? ribbon.thickness + EDGE_REACH * 2 : ribbon.thickness;
    for (const [x, y] of outline(ribbon.points, reach)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  for (const block of blocks) {
    minX = Math.min(minX, block.x);
    maxX = Math.max(maxX, block.x + block.width);
    minY = Math.min(minY, block.y);
    maxY = Math.max(maxY, block.y + block.height);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const halfWidth = Math.max(MIN_HALF_WIDTH, Math.max(Math.abs(minX - cx), Math.abs(maxX - cx)) * 1.06);
  const halfHeight = Math.max(MIN_HALF_HEIGHT, Math.max(Math.abs(minY - cy), Math.abs(maxY - cy)) * 1.1);

  // Scene y runs up, SVG y runs down: flip once here.
  const sx = (x: number) => r(x - cx);
  const sy = (y: number) => r(-(y - cy));

  return {
    viewBox: `${r(-halfWidth)} ${r(-halfHeight)} ${r(halfWidth * 2)} ${r(halfHeight * 2)}`,
    ribbons: outlines.map(({ ribbon, shape }) => ({
      d: `M ${shape.map(([x, y]) => `${sx(x)} ${sy(y)}`).join(" L ")} Z`,
      kind: ribbon.fee
        ? ribbon.estimated
          ? "feeEstimated"
          : "fee"
        : ribbon.estimated
          ? "estimated"
          : "known",
    })),
    blocks: blocks.map((block) => ({
      x: sx(block.x),
      y: sy(block.y + block.height),
      width: r(block.width),
      height: r(block.height),
      owned: block.owned,
    })),
    collar: {
      x: sx(-COLLAR_RADIUS),
      y: sy(collarHalf),
      width: r(COLLAR_RADIUS * 2),
      height: r(collarHalf * 2),
    },
  };
}
