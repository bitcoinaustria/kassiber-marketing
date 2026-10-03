import {
  Box3,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  OrthographicCamera,
  PMREMGenerator,
  Raycaster,
  Scene,
  Sphere,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import { BLOCK_DEPTH, BLOCK_WIDTH, RIBBON_DEPTH, type RibbonLayout } from "./ribbonLayout";

/*
 * The app's glass stage, materials and ribbon scene in one module, ported from
 * ui-tauri/src/components/kb/glass3d/{stage,materials}.ts and
 * ui-tauri/src/components/transactions/graph3d/glassScene.ts. Dark tones only:
 * the site has no light theme.
 *
 * Import this only through a dynamic import(), so three.js stays out of the
 * page's first load and is fetched once the graph scrolls near.
 */

export type GlassScene = {
  resize: (width: number, height: number) => void;
  setView: (yaw: number, pitch: number) => void;
  /** Explicit draw; no animation loop or background work. */
  render: () => void;
  /** The leg under a point in normalised device coordinates, or null. */
  pick: (x: number, y: number) => string | null;
  /** Lights one leg's ribbon and coin, or none. Call render after. */
  highlight: (legId: string | null) => void;
  dispose: () => void;
};

/** What a scene hands its stage: the hit areas and how to light a leg. */
type Populated = { highlight: (legId: string | null) => void };

type GlassTone = {
  color: string;
  attenuation: string;
  roughness: number;
  distance: number;
  /** Below 1 the base colour shows; a dark surface leaves full glass black. */
  transmission: number;
  glow: string;
  glowIntensity: number;
  rim: string;
};

const TONES = {
  known: { color: "#9cc4ff", attenuation: "#3b82f6", roughness: 0.05, distance: 1.4, transmission: 0.55, glow: "#1d4ed8", glowIntensity: 0.45, rim: "#cfe1ff" },
  estimated: { color: "#cbd3de", attenuation: "#94a3b8", roughness: 0.5, distance: 3, transmission: 0.45, glow: "#334155", glowIntensity: 0.4, rim: "#e2e8f0" },
  fee: { color: "#ffd466", attenuation: "#f59e0b", roughness: 0.06, distance: 1, transmission: 0.5, glow: "#b45309", glowIntensity: 0.6, rim: "#fff1c2" },
  feeEstimated: { color: "#e9dcb8", attenuation: "#c9a860", roughness: 0.5, distance: 2.5, transmission: 0.45, glow: "#57451f", glowIntensity: 0.4, rim: "#f6ecd2" },
  center: { color: "#dbe5f3", attenuation: "#60a5fa", roughness: 0.03, distance: 4, transmission: 0.62, glow: "#1e293b", glowIntensity: 0.5, rim: "#e0ecff" },
} satisfies Record<string, GlassTone>;

function glass(tone: GlassTone, thickness = 0.6) {
  return new MeshPhysicalMaterial({
    color: new Color(tone.color),
    metalness: 0,
    roughness: tone.roughness,
    transmission: tone.transmission,
    thickness,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    attenuationColor: new Color(tone.attenuation),
    attenuationDistance: tone.distance,
    specularIntensity: 1,
    emissive: new Color(tone.glow),
    emissiveIntensity: tone.glowIntensity,
    // A light rim on grazing edges reads as cut acrylic.
    sheen: 1,
    sheenColor: new Color(tone.rim),
    sheenRoughness: 0.25,
  });
}

function satin(color: string) {
  return new MeshPhysicalMaterial({
    color: new Color(color),
    metalness: 0.15,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
}

/** The book's own coins in satin blue, anyone else's in grey. */
function coinMaterial(owned: boolean) {
  return satin(owned ? "#2563eb" : "#64748b");
}

/**
 * Owns all content geometry and registered materials, including on build
 * failure. The camera is orthographic and its frame only grows, so turning
 * never clips the piece.
 */
function createGlassStage(
  canvas: HTMLCanvasElement,
  background: string,
  populate: (content: Group, hits: Group, own: <T extends Material>(material: T) => T) => Populated,
  { minHalfWidth = 4.4, minHalfHeight = 2.5 } = {},
): GlassScene {
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "low-power" });
  const scene = new Scene();
  const content = new Group();
  // Pointer targets, wider than the thin strands. Kept out of `content`, so
  // they never widen the camera frame the SVG front view has to match.
  const hits = new Group();
  const materials = new Set<Material>();
  let environment: WebGLRenderTarget | undefined;
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    const geometries = new Set<Mesh["geometry"]>();
    for (const group of [content, hits]) group.traverse((object) => {
      if (object instanceof Mesh) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          materials.add(material);
        }
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    environment?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NeutralToneMapping;

    // Opaque, in the surface colour: transmission refracts what is behind the
    // glass, and a transparent clear would make every ribbon look dark.
    scene.background = new Color(background);
    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    try {
      environment = pmrem.fromScene(room, 0.04);
      scene.environment = environment.texture;
    } finally {
      room.dispose();
      pmrem.dispose();
    }
    scene.environmentIntensity = 0.9;
    scene.add(new HemisphereLight(0xffffff, 0x334155, 0.7));
    const key = new DirectionalLight(0xffffff, 2.2);
    key.position.set(-4, 7, 8);
    scene.add(key);

    const { highlight } = populate(content, hits, (material) => {
      materials.add(material);
      return material;
    });
    const pivot = new Group();
    const holder = new Group();
    const bounds = new Box3().setFromObject(content);
    holder.position.sub(bounds.getCenter(new Vector3()));
    holder.add(content, hits);
    pivot.add(holder);
    scene.add(pivot);
    const raycaster = new Raycaster();

    const reach = Math.max(0, new Box3().setFromObject(pivot).getBoundingSphere(new Sphere()).radius);
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, reach * 2 + 20);
    camera.position.set(0, 0, reach + 10);
    camera.lookAt(0, 0, 0);
    let frame = { halfWidth: 0, halfHeight: 0 };
    let size = { width: 1, height: 1 };

    // Fitted to the turned vertices, not to the turned bounding boxes as in the
    // app: a box turned into the three-quarter view overshoots the piece by a
    // third, and on a page the piece should fill its panel. A few thousand
    // vertices per turn is cheap.
    const fit = () => {
      pivot.updateMatrixWorld(true);
      const box = new Box3().setFromObject(content, true);
      if (box.isEmpty()) box.set(new Vector3(), new Vector3());
      frame = {
        halfWidth: Math.max(frame.halfWidth, minHalfWidth, Math.max(Math.abs(box.min.x), Math.abs(box.max.x)) * 1.06),
        halfHeight: Math.max(frame.halfHeight, minHalfHeight, Math.max(Math.abs(box.min.y), Math.abs(box.max.y)) * 1.1),
      };
    };
    const applyFrame = () => {
      if (!frame.halfWidth || !frame.halfHeight) return;
      const aspect = size.width / Math.max(1, size.height);
      let { halfWidth, halfHeight } = frame;
      if (halfWidth / halfHeight > aspect) halfHeight = halfWidth / aspect;
      else halfWidth = halfHeight * aspect;
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
    };

    return {
      resize(width, height) {
        size = { width: Math.max(1, width), height: Math.max(1, height) };
        renderer.setSize(size.width, size.height, false);
        applyFrame();
      },
      setView(yaw, pitch) {
        pivot.rotation.set(pitch, yaw, 0);
        fit();
        applyFrame();
      },
      render() {
        renderer.render(scene, camera);
      },
      pick(x, y) {
        raycaster.setFromCamera(new Vector2(x, y), camera);
        const [hit] = raycaster.intersectObjects(hits.children, false);
        return (hit?.object.userData.legId as string | undefined) ?? null;
      },
      highlight,
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

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
