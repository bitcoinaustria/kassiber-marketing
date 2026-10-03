import { Mesh, MeshBasicMaterial, type BufferGeometry } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import { coinMaterial, createGlassStage, glass, satin, TONES, type GlassScene } from "../glass/stage";
import { BLOCK_DEPTH, BLOCK_WIDTH, type CoinBlock } from "./coins";

/*
 * The wallet's coins as glass blocks, ported from the app's
 * ui-tauri/src/components/kb/wallets/utxo3d/utxoBlocksScene.ts: the book's own
 * coins in the transaction graph's satin blue, an unconfirmed coin frosted,
 * the graph's cue for "not settled".
 *
 * The app rebuilds the scene when values are hidden. Here the same blocks
 * move instead: `place` sets each block's height and slot, and the page eases
 * between the two arrangements, so the switch reads as the amounts levelling
 * out rather than as a new picture. Import only through a dynamic import().
 */

export type CoinScene = GlassScene & {
  /** Puts every block at the given height and position; render afterwards. */
  place: (blocks: readonly CoinBlock[]) => void;
};

const box = (height: number) => new RoundedBoxGeometry(BLOCK_WIDTH, Math.max(0.001, height), BLOCK_DEPTH, 3, Math.min(0.05, height / 2.5));

export function createCoinScene(canvas: HTMLCanvasElement, blocks: readonly CoinBlock[], background: string): CoinScene {
  const meshes = new Map<string, { mesh: Mesh; hit: Mesh; height: number }>();
  const stage = createGlassStage(canvas, background, (content, hits, own) => {
    const clear = own(coinMaterial(true));
    const frosted = own(glass(TONES.estimated));
    const lit = {
      clear: own(satin("#60a5fa")),
      frosted: own(glass({ ...TONES.estimated, color: "#eef2f7", glow: "#64748b", glowIntensity: 1.1 })),
    };
    const hitMaterial = own(new MeshBasicMaterial({ visible: false }));
    for (const block of blocks) {
      const mesh = new Mesh(box(block.height), block.frosted ? frosted : clear);
      mesh.position.set(block.x, block.y, 0);
      mesh.userData.frosted = block.frosted;
      content.add(mesh);
      // Dust is a sliver; give the pointer a whole coin's worth to land on.
      const hit = new Mesh(box(Math.max(block.height, 0.5)), hitMaterial);
      hit.position.set(block.x, Math.max(block.height, 0.5) / 2, 0);
      hit.userData.legId = block.id;
      hits.add(hit);
      meshes.set(block.id, { mesh, hit, height: block.height });
    }
    return {
      highlight(id) {
        for (const [key, { mesh }] of meshes) {
          const isFrosted = mesh.userData.frosted as boolean;
          mesh.material = key === id ? (isFrosted ? lit.frosted : lit.clear) : isFrosted ? frosted : clear;
        }
      },
    };
  });

  const swap = (target: Mesh, geometry: BufferGeometry) => {
    target.geometry.dispose();
    target.geometry = geometry;
  };

  return {
    ...stage,
    place(next) {
      for (const block of next) {
        const entry = meshes.get(block.id);
        if (!entry) continue;
        // Only a changed height needs new geometry; sliding is just position.
        if (Math.abs(entry.height - block.height) > 1e-4) {
          swap(entry.mesh, box(block.height));
          swap(entry.hit, box(Math.max(block.height, 0.5)));
          entry.height = block.height;
        }
        entry.mesh.position.set(block.x, block.y, block.z ?? 0);
        entry.hit.position.set(block.x, Math.max(block.height, 0.5) / 2, block.z ?? 0);
      }
    },
  };
}
