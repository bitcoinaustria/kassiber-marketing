import {
  Box3,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  OrthographicCamera,
  PMREMGenerator,
  Raycaster,
  Scene,
  Sphere,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/*
 * The app's glass stage and materials, ported from
 * ui-tauri/src/components/kb/glass3d/{stage,materials}.ts, shared by every 3D
 * piece on the site (the transaction graph and the wallet's coins), as the app
 * shares them. Dark tones only: the site has no light theme.
 *
 * Import only from a lazily loaded scene module, so three.js stays out of the
 * page's first load.
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
export type Populated = { highlight: (legId: string | null) => void };

export type GlassTone = {
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

export const TONES = {
  known: { color: "#9cc4ff", attenuation: "#3b82f6", roughness: 0.05, distance: 1.4, transmission: 0.55, glow: "#1d4ed8", glowIntensity: 0.45, rim: "#cfe1ff" },
  estimated: { color: "#cbd3de", attenuation: "#94a3b8", roughness: 0.5, distance: 3, transmission: 0.45, glow: "#334155", glowIntensity: 0.4, rim: "#e2e8f0" },
  fee: { color: "#ffd466", attenuation: "#f59e0b", roughness: 0.06, distance: 1, transmission: 0.5, glow: "#b45309", glowIntensity: 0.6, rim: "#fff1c2" },
  feeEstimated: { color: "#e9dcb8", attenuation: "#c9a860", roughness: 0.5, distance: 2.5, transmission: 0.45, glow: "#57451f", glowIntensity: 0.4, rim: "#f6ecd2" },
  center: { color: "#dbe5f3", attenuation: "#60a5fa", roughness: 0.03, distance: 4, transmission: 0.62, glow: "#1e293b", glowIntensity: 0.5, rim: "#e0ecff" },
} satisfies Record<string, GlassTone>;

export function glass(tone: GlassTone, thickness = 0.6) {
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

export function satin(color: string) {
  return new MeshPhysicalMaterial({
    color: new Color(color),
    metalness: 0.15,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
}

/** The book's own coins in satin blue, anyone else's in grey. */
export function coinMaterial(owned: boolean) {
  return satin(owned ? "#2563eb" : "#64748b");
}

/**
 * Owns all content geometry and registered materials, including on build
 * failure. The camera is orthographic and its frame only grows, so turning
 * never clips the piece.
 */
export function createGlassStage(
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
