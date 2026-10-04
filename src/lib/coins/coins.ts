/*
 * A wallet's unspent coins as glass blocks, ported from the app's
 * ui-tauri/src/components/kb/wallets/utxo3d/utxoBlocksLayout.ts: one block per
 * coin, as tall as its amount relative to the wallet's largest, with a dust
 * floor. Hidden mode never reads amounts: every block gets the same height and
 * the order follows the outpoint, so nothing about the values shows through.
 *
 * The demo wallet is the hero's Satoshi-Onchain-Multi: these fourteen coins
 * add up to its ₿ 1.0165 on the Overview. Illustrative, not a real chain.
 */

export const BLOCK_WIDTH = 0.8;
export const BLOCK_DEPTH = 0.6;
const MIN_BLOCK_HEIGHT = 0.12;
export const MAX_BLOCK_HEIGHT = 2.8;
const UNIFORM_BLOCK_HEIGHT = 1.2;
const GAP = 0.5;

export type Coin = {
  outpoint: string;
  sats: number;
  confirmed: boolean;
  /** Receive or change branch and index, as the app's Location column reads. */
  location: string;
  /** Confirmation date, or the mempool. */
  when: string;
  confirmations: number;
};

export const WALLET = "Satoshi-Onchain-Multi";

export const COINS: Coin[] = [
  { outpoint: "3f9a2c71e0…b81d:0", sats: 31_250_000, confirmed: true, location: "receive #4", when: "2026-01-05", confirmations: 38_912 },
  { outpoint: "a41c08d5f2…7e03:1", sats: 18_400_000, confirmed: true, location: "receive #9", when: "2026-05-02", confirmations: 21_708 },
  { outpoint: "07be6f13c9…4a52:0", sats: 12_500_000, confirmed: true, location: "receive #11", when: "2026-03-18", confirmations: 28_144 },
  { outpoint: "d2e51b9a04…c6f7:1", sats: 9_830_000, confirmed: true, location: "change #6", when: "2026-07-11", confirmations: 11_930 },
  { outpoint: "5c80fa2e67…19bd:0", sats: 7_200_000, confirmed: true, location: "receive #13", when: "2026-06-20", confirmations: 14_962 },
  { outpoint: "e6d3417b8c…02a9:0", sats: 5_600_000, confirmed: true, location: "receive #7", when: "2026-02-27", confirmations: 31_046 },
  { outpoint: "91f07c2db5…e84c:1", sats: 4_410_000, confirmed: true, location: "change #3", when: "2025-11-08", confirmations: 47_311 },
  { outpoint: "28ab95e1f0…6d37:0", sats: 3_700_000, confirmed: false, location: "receive #16", when: "mempool", confirmations: 0 },
  { outpoint: "bb4e0d6a93…a1f5:0", sats: 3_100_000, confirmed: true, location: "receive #15", when: "2026-09-17", confirmations: 2_302 },
  { outpoint: "6f12c8e0a7…3b98:1", sats: 2_460_000, confirmed: true, location: "change #8", when: "2026-08-04", confirmations: 8_390 },
  { outpoint: "c79d53f2b1…8e60:0", sats: 1_520_000, confirmed: false, location: "receive #17", when: "mempool", confirmations: 0 },
  { outpoint: "14e6a0bd38…f529:1", sats: 980_000, confirmed: true, location: "change #9", when: "2026-09-02", confirmations: 4_318 },
  { outpoint: "8d3f7e21c5…0c4a:0", sats: 545_000, confirmed: true, location: "receive #2", when: "2025-10-21", confirmations: 49_870 },
  { outpoint: "f0a2b96e4d…5d16:1", sats: 155_000, confirmed: true, location: "change #1", when: "2025-12-14", confirmations: 44_027 },
];

export type CoinBlock = {
  id: string;
  frosted: boolean;
  x: number;
  y: number;
  /** Depth offset, only while blocks slide past each other. */
  z?: number;
  height: number;
};

/** Hidden values sort by outpoint; shown ones largest first, as the app does. */
export function coinBlocks(coins: readonly Coin[], hidden: boolean): CoinBlock[] {
  const ordered = [...coins].sort((a, b) =>
    hidden ? (a.outpoint < b.outpoint ? -1 : 1) : b.sats - a.sats || (a.outpoint < b.outpoint ? -1 : 1),
  );
  const largest = hidden ? 0 : ordered[0]?.sats ?? 0;
  return ordered.map((coin, index) => {
    const height = hidden ? UNIFORM_BLOCK_HEIGHT : Math.max(MIN_BLOCK_HEIGHT, largest ? (coin.sats / largest) * MAX_BLOCK_HEIGHT : 0);
    return {
      id: coin.outpoint,
      frosted: !coin.confirmed,
      // One shelf, centred on x = 0, every block standing on y = 0.
      x: (index - (ordered.length - 1) / 2) * (BLOCK_WIDTH + GAP),
      y: height / 2,
      height,
    };
  });
}

/*
 * The straight-on SVG, framed as the glass stage frames the scene at yaw 0:
 * content centred on its bounding box, a frame of at least 4.4 × 2.5 with the
 * stage's margins. The scene is always built from the shown values, and the
 * hidden view keeps that frame, so the picture never jumps on the switch.
 */
export function coinFrame(blocks: readonly CoinBlock[]) {
  const shown = coinBlocks(COINS, false);
  const minX = Math.min(...shown.map((b) => b.x - BLOCK_WIDTH / 2));
  const maxX = Math.max(...shown.map((b) => b.x + BLOCK_WIDTH / 2));
  const maxY = Math.max(...shown.map((b) => b.y + b.height / 2));
  const cx = (minX + maxX) / 2;
  const cy = maxY / 2;
  const halfWidth = Math.max(4.4, ((maxX - minX) / 2) * 1.06);
  const halfHeight = Math.max(2.5, (maxY / 2) * 1.1);
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return {
    viewBox: `${r(-halfWidth)} ${r(-halfHeight)} ${r(halfWidth * 2)} ${r(halfHeight * 2)}`,
    rects: blocks.map((block) => ({
      id: block.id,
      frosted: block.frosted,
      x: r(block.x - BLOCK_WIDTH / 2 - cx),
      y: r(-(block.y + block.height / 2 - cy)),
      width: BLOCK_WIDTH,
      height: r(block.height),
    })),
  };
}

export const TOTAL_SATS = COINS.reduce((sum, coin) => sum + coin.sats, 0);
export const PENDING = COINS.filter((coin) => !coin.confirmed).length;

export function btc(sats: number) {
  return `₿ ${(sats / 100_000_000).toFixed(8)}`;
}
