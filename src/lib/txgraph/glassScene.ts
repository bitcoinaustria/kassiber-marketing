import {
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  TubeGeometry,
  Vector3,
  type Material,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import { coinMaterial, createGlassStage, glass, satin, TONES, type GlassScene, type GlassTone } from "../glass/stage";
import { BLOCK_DEPTH, BLOCK_WIDTH, RIBBON_DEPTH, type RibbonLayout } from "./ribbonLayout";

export type { GlassScene } from "../glass/stage";

/*
 * The transaction graph's ribbon scene, ported from the app's
 * ui-tauri/src/components/transactions/graph3d/glassScene.ts, on the shared
 * glass stage (../glass/stage.ts).
 *
 * Import this only through a dynamic import(), so three.js stays out of the
 * page's first load and is fetched once the graph scrolls near.
 */

const EDGE = 0.014;
const PROFILE_STEPS = 4;
/** Ribbons thinner than this get no edge lines: the lines would swallow them. */
const EDGED_THICKNESS = 0.08;

/** A stadium cross-section: flat faces towards the viewer, round edges. */
function profile(height: number, depth: number) {
  const radius = Math.min(depth / 2, height / 2);
  const reach = height / 2 - radius;
  const points: Array<[number, number]> = [];
  for (let step = 0; step <= PROFILE_STEPS; step += 1) {
    const angle = -Math.PI / 2 + (Math.PI * step) / PROFILE_STEPS;
    points.push([reach + radius * Math.cos(angle), radius * Math.sin(angle)]);
  }
  for (let step = 0; step <= PROFILE_STEPS; step += 1) {
    const angle = Math.PI / 2 + (Math.PI * step) / PROFILE_STEPS;
    points.push([-reach + radius * Math.cos(angle), radius * Math.sin(angle)]);
  }
  return points;
}

/**
 * A flat ribbon swept along a centreline in the xy plane, capped at both ends.
 * `height` is its width across the path; `offset` shifts it sideways, for the
 * edge lines beside a ribbon.
 */
function ribbonGeometry(path: ReadonlyArray<readonly [number, number]>, height: number, depth = RIBBON_DEPTH, offset = 0) {
  const ring = profile(height, depth);
  const positions: number[] = [];
  const indices: number[] = [];
  path.forEach(([x, y], index) => {
    const [ax, ay] = path[Math.max(0, index - 1)];
    const [bx, by] = path[Math.min(path.length - 1, index + 1)];
    const length = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / length;
    const ny = (bx - ax) / length;
    for (const [across, deep] of ring) {
      positions.push(x + nx * (across + offset), y + ny * (across + offset), deep);
    }
  });
  const size = ring.length;
  for (let index = 0; index < path.length - 1; index += 1) {
    for (let corner = 0; corner < size; corner += 1) {
      const a = index * size + corner;
      const b = index * size + ((corner + 1) % size);
      const c = a + size;
      const d = b + size;
      // The profile runs counterclockwise around the path, so this order
      // turns the side faces outward, like the end caps.
      indices.push(a, b, c, b, d, c);
    }
  }
  for (const [ringIndex, flip] of [
    [0, true],
    [path.length - 1, false],
  ] as const) {
    const centre = positions.length / 3;
    const [ex, ey] = [0, 1].map((axis) => {
      let sum = 0;
      for (let corner = 0; corner < size; corner += 1) {
        sum += positions[(ringIndex * size + corner) * 3 + axis];
      }
      return sum / size;
    });
    positions.push(ex, ey, 0);
    for (let corner = 0; corner < size; corner += 1) {
      const a = ringIndex * size + corner;
      const b = ringIndex * size + ((corner + 1) % size);
      indices.push(...(flip ? [centre, b, a] : [centre, a, b]));
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * The collar where every input's ribbons end and the outputs' begin: a
 * rounded-rectangle glass loop around the waist, in the yz plane at x = 0.
 */
function collarGeometry(halfHeight: number, halfDepth: number, radius: number) {
  const corner = Math.min(halfDepth, halfHeight) * 0.9;
  const points: Vector3[] = [];
  const corners: Array<[number, number, number]> = [
    [halfHeight - corner, halfDepth - corner, 0],
    [-(halfHeight - corner), halfDepth - corner, Math.PI / 2],
    [-(halfHeight - corner), -(halfDepth - corner), Math.PI],
    [halfHeight - corner, -(halfDepth - corner), (3 * Math.PI) / 2],
  ];
  for (const [cy, cz, start] of corners) {
    for (let step = 0; step <= 6; step += 1) {
      const angle = start + ((Math.PI / 2) * step) / 6;
      points.push(new Vector3(0, cy + corner * Math.cos(angle), cz + corner * Math.sin(angle)));
    }
  }
  return new TubeGeometry(new CatmullRomCurve3(points, true), 96, radius, 12, true);
}

/** A hovered leg glows brighter, as the flat graph's hover gradient lifts a strand. */
const lift = (tone: GlassTone, color: string, glow: string, glowIntensity: number): GlassTone => ({
  ...tone,
  color,
  glow,
  glowIntensity,
});

export function createGlassScene(canvas: HTMLCanvasElement, layout: RibbonLayout, background: string): GlassScene {
  return createGlassStage(canvas, background, (content, hits, own) => {
    const materials = {
      known: own(glass(TONES.known)),
      estimated: own(glass(TONES.estimated)),
      fee: own(glass(TONES.fee)),
      feeEstimated: own(glass(TONES.feeEstimated)),
      center: own(glass(TONES.center, 1.4)),
      // The dark line along each ribbon edge that gives the lab pieces their drawing.
      edge: own(satin("#0b1220")),
      owned: own(coinMaterial(true)),
      external: own(coinMaterial(false)),
    } satisfies Record<string, Material>;

    const lit = {
      known: own(glass(lift(TONES.known, "#dbe9ff", "#3b82f6", 1.35))),
      estimated: own(glass(lift(TONES.estimated, "#eef2f7", "#64748b", 1.1))),
      fee: own(glass(lift(TONES.fee, "#ffe7a3", "#f59e0b", 1.4))),
      feeEstimated: own(glass(lift(TONES.feeEstimated, "#f6eed8", "#a8894a", 1.1))),
      owned: own(satin("#60a5fa")),
      external: own(satin("#cbd5e1")),
    } satisfies Record<string, Material>;
    const hitMaterial = own(new MeshBasicMaterial({ visible: false }));

    // One mesh per ribbon, unlike the app's merged batches, so a hovered leg
    // can light up on its own. A few dozen meshes is nothing to draw.
    const lightable: Array<{ mesh: Mesh; legId: string; base: Material; on: Material }> = [];
    const edges: BufferGeometry[] = [];
    for (const ribbon of layout.ribbons) {
      const kind = ribbon.fee
        ? ribbon.estimated
          ? "feeEstimated"
          : "fee"
        : ribbon.estimated
          ? "estimated"
          : "known";
      const mesh = new Mesh(ribbonGeometry(ribbon.points, ribbon.thickness), materials[kind]);
      content.add(mesh);
      lightable.push({ mesh, legId: ribbon.legId, base: materials[kind], on: lit[kind] });
      // A strand as thin as dust still needs a target a pointer can land on.
      const hit = new Mesh(ribbonGeometry(ribbon.points, Math.max(ribbon.thickness, 0.16), 0.3), hitMaterial);
      hit.userData.legId = ribbon.legId;
      hits.add(hit);
      // Only along the edges: a full backing would darken the glass it shows through.
      if (ribbon.fee || ribbon.thickness < EDGED_THICKNESS) continue;
      for (const side of [1, -1]) {
        edges.push(ribbonGeometry(ribbon.points, EDGE * 2, RIBBON_DEPTH * 0.7, side * (ribbon.thickness / 2 + EDGE * 0.4)));
      }
    }
    if (edges.length) {
      const merged = mergeGeometries(edges);
      edges.forEach((geometry) => geometry.dispose());
      if (merged) content.add(new Mesh(merged, materials.edge));
    }
    for (const leg of layout.legs) {
      const base = leg.owned ? materials.owned : materials.external;
      const block = new Mesh(
        new RoundedBoxGeometry(
          BLOCK_WIDTH,
          leg.height,
          // Thin coins are shallow too: seen from above, a deep block would
          // cover the gap to its neighbour and a fan-in would read as one wall.
          Math.min(BLOCK_DEPTH, Math.max(0.08, leg.height * 3)),
          3,
          Math.min(0.05, leg.height / 2.5),
        ),
        base,
      );
      block.position.set(leg.x, leg.y, 0);
      content.add(block);
      lightable.push({ mesh: block, legId: leg.id, base, on: leg.owned ? lit.owned : lit.external });
      const hit = new Mesh(new RoundedBoxGeometry(BLOCK_WIDTH, Math.max(leg.height, 0.16), BLOCK_DEPTH, 1, 0.01), hitMaterial);
      hit.position.copy(block.position);
      hit.userData.legId = leg.id;
      hits.add(hit);
    }
    content.add(new Mesh(collarGeometry(layout.center.halfHeight, RIBBON_DEPTH / 2 + 0.07, 0.05), materials.center));

    return {
      highlight(legId) {
        for (const { mesh, legId: id, base, on } of lightable) mesh.material = id === legId ? on : base;
      },
    };
  });
}
