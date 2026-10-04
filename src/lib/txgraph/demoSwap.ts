import type { GraphRow, GraphTransaction } from "./geometry";

/*
 * Illustrative demo data for the pairing section: an L-BTC → BTC atomic swap,
 * paired as one move. Shaped like the app's regtest demo book, not copied from
 * a real chain.
 *
 * Liquid leg: the wallet consolidates eight of its own coins into the swap's
 * lockup. Its own legs unblind, so their amounts are known; the lockup belongs
 * to the swap service, stays confidential, and draws as a frosted ribbon.
 * Bitcoin leg: the claim, one coin in and the received amount out to the
 * wallet, minus the network fee.
 */

export type IoRow = {
  /** The graph row it lists, so a hovered strand and its row light up together. */
  id: string;
  /** What the hover card leads with, as the app's nodeTooltipTitle picks it. */
  title: string;
  /** Short outpoint, as the app's formatShortTxid prints it. */
  ref: string;
  meta: string[];
  /** Satoshis, or null for a confidential amount. */
  sats: number | null;
};

export type SwapLeg = {
  key: "liquid" | "bitcoin";
  graph: GraphTransaction;
  inputs: IoRow[];
  outputs: IoRow[];
};

const own = (id: string, sats: number | null, side: GraphRow["side"]): GraphRow => ({ id, side, sats, owned: true });
const other = (id: string, sats: number | null, side: GraphRow["side"]): GraphRow => ({ id, side, sats, owned: false });

const LIQUID_INPUTS = [
  { ref: "8f3c2a91d4…e71b:1", sats: 1_250_000 },
  { ref: "c40d97be12…09fa:0", sats: 890_000 },
  { ref: "2be5f0c3a8…44d2:1", sats: 640_000 },
  { ref: "e9a1774d60…b3c8:0", sats: 510_000 },
  { ref: "5d08c6f2e7…7a19:1", sats: 380_000 },
  { ref: "a7f3e2091b…c6d0:0", sats: 260_000 },
  { ref: "13cb84a5f9…2e57:1", sats: 170_000 },
  { ref: "f62d1e8c3a…9b04:0", sats: 100_312 },
];

const LIQUID_FEE = 312;

export const SWAP_LEGS: Record<SwapLeg["key"], SwapLeg> = {
  liquid: {
    key: "liquid",
    graph: {
      chain: "liquid",
      inputs: LIQUID_INPUTS.map((input, index) => own(`in-${index}`, input.sats, "input")),
      outputs: [other("lockup", null, "output")],
      fee: own("fee", LIQUID_FEE, "fee"),
    },
    inputs: LIQUID_INPUTS.map((input, index) => ({
      id: `in-${index}`,
      title: "Satoshi-Liquid",
      ref: input.ref,
      meta: ["Internal wallet leg", "segwit v0", `#${index}`],
      sats: input.sats,
    })),
    // The fee is a strand of its own, not a listed output, as in the app.
    outputs: [{ id: "lockup", title: "lq1qq2xv…k8m4f0", ref: "b71e04c9d2…5f3a:0", meta: ["External recipient", "External wallet leg", "#0"], sats: null }],
  },
  bitcoin: {
    key: "bitcoin",
    graph: {
      chain: "bitcoin",
      inputs: [other("lockup", 4_196_150, "input")],
      outputs: [own("claim", 4_195_800, "output")],
      fee: other("fee", 350, "fee"),
    },
    inputs: [{ id: "lockup", title: "bc1pz7ux…q3nl0w", ref: "6ac2f19e07…d84b:0", meta: ["External wallet leg", "taproot", "#0"], sats: 4_196_150 }],
    outputs: [{ id: "claim", title: "Satoshi-Onchain-Multi", ref: "f1c4a5fb55…6f8e:0", meta: ["Incoming payment", "Internal wallet leg", "segwit v0", "#0"], sats: 4_195_800 }],
  },
};

/** "₿ 0.04200000", as the app prints a leg amount. */
export function formatBtc(sats: number) {
  return `₿ ${(sats / 100_000_000).toFixed(8)}`;
}
