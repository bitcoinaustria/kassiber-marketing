/*
 * Strand widths and positions for the transaction graph, ported from the app's
 * ui-tauri/src/components/transactions/TransactionGraphGeometry.ts. The app
 * follows mempool's bowtie graph (frontend/src/app/components/tx-bowtie-graph:
 * calcTotalValue, initLines and linesFromWeights), and both the glass 3D view
 * and the flat fallback draw from it, so they tell the same story.
 *
 * Trimmed to what the site draws: no "+N more" folding (the demo transactions
 * stay well under mempool's 250-leg limit) and no hidden-values redaction.
 */

export type GraphSide = "input" | "output" | "fee";

export type GraphRow = {
  id: string;
  side: GraphSide;
  /** Satoshis, or null when the amount is not known (a confidential Liquid leg). */
  sats: number | null;
  owned: boolean;
};

/** mempool's `minWeight`: the thinnest strand is this wide. */
const MIN_WEIGHT = 2;
/** The least space between two strands' outer ends, as in mempool. */
const MIN_SPACING = 4;

/** A leg's value as mempool reads it: `null` when unknown. */
export function legValue(row: GraphRow): number | null {
  return row.sats === null ? null : Math.max(0, row.sats);
}

function knownTotal(rows: GraphRow[]) {
  return rows.reduce((sum, row) => sum + (legValue(row) ?? 0), 0);
}

function unknownLegs(rows: GraphRow[]) {
  return rows.reduce((sum, row) => sum + (legValue(row) === null ? 1 : 0), 0);
}

/**
 * mempool's calcTotalValue. Bitcoin: the outputs plus the fee, which sits among
 * the destination rows. Liquid: with unknown legs on both sides the total is
 * indeterminate, so unknown legs are assumed to be as large as the average
 * known leg on their side; otherwise the larger known side is the total.
 */
export function bowtieTotal(inputRows: GraphRow[], destinationRows: GraphRow[], liquid: boolean) {
  const totalOutput = knownTotal(destinationRows);
  if (!liquid) return totalOutput;
  const totalInput = knownTotal(inputRows);
  const unknownInputs = unknownLegs(inputRows);
  const unknownOutputs = unknownLegs(destinationRows);
  if (unknownInputs && unknownOutputs) {
    const knownInputCount = inputRows.length - unknownInputs || 1;
    const knownOutputCount = destinationRows.length - unknownOutputs || 1;
    return Math.max(
      totalInput + (totalInput / knownInputCount) * unknownInputs,
      totalOutput + (totalOutput / knownOutputCount) * unknownOutputs,
    );
  }
  return Math.max(totalInput, totalOutput);
}

/**
 * mempool's initLines: each leg's share of the band where the legs meet. Unknown
 * legs split what the total leaves after this side's known legs.
 */
export function bowtieWeights(rows: GraphRow[], total: number, combinedWeight: number) {
  if (!total) return rows.map(() => combinedWeight / Math.max(1, rows.length));
  const unknownRows = rows.filter((row) => legValue(row) === null).length;
  const unknownShare = unknownRows ? (total - knownTotal(rows)) / unknownRows : 0;
  return rows.map((row) => Math.max(0, (combinedWeight * (legValue(row) ?? unknownShare)) / total));
}

export type BowtieLine = {
  /** Centre of the strand's outer end. */
  outerY: number;
  /** Centre of the strand where it meets the band. */
  innerY: number;
  thickness: number;
  /** Share of the band, in the same unit as `combinedWeight`. */
  weight: number;
  /** mempool's normalised curve offset, which keeps neighbouring strands apart. */
  offset: number;
  /** mempool's `pad + maxOffset`: where the side's curves start before any offset. */
  curveBase: number;
  /** A known amount of zero: drawn as a stub that never reaches the band. */
  zeroValue: boolean;
  /** No known amount: the width is an estimate. */
  estimated: boolean;
};

function strandThickness(value: number | null, weight: number, combinedWeight: number, zeroThickness: number) {
  return value === 0 ? zeroThickness : Math.min(combinedWeight + 0.5, Math.max(MIN_WEIGHT - 1, weight) + 1);
}

/**
 * mempool's linesFromWeights: strand thickness, the outer ends spread over the
 * same span on both sides, and the inner ends stacked into the band.
 */
export function bowtieLines(
  rows: GraphRow[],
  total: number,
  {
    height,
    combinedWeight,
    curveWidth,
    outerTop,
    outerSpan,
    zeroThickness,
  }: {
    height: number;
    combinedWeight: number;
    /** Horizontal run of a strand's curve, for the overlap correction. */
    curveWidth: number;
    /** Where the first outer end starts, and the span the outer ends fill. */
    outerTop: number;
    outerSpan: number;
    zeroThickness: number;
  },
): BowtieLine[] {
  if (!rows.length) return [];
  const weights = bowtieWeights(rows, total, combinedWeight);
  const lines: BowtieLine[] = rows.map((row, index) => {
    const value = legValue(row);
    return {
      outerY: height / 2,
      innerY: height / 2,
      thickness: strandThickness(value, weights[index], combinedWeight, zeroThickness),
      weight: weights[index],
      offset: 0,
      curveBase: 0,
      zeroValue: value === 0,
      estimated: value === null,
    };
  });
  const visibleWeight = lines.reduce((sum, line) => sum + line.thickness, 0);
  const spacing =
    lines.length <= 1 ? 0 : Math.max(MIN_SPACING, (outerSpan - visibleWeight) / (lines.length - 1));
  const innerTop = height / 2 - combinedWeight / 2;
  const innerBottom = innerTop + combinedWeight + 0.5;
  let lastOuter = outerTop;
  let lastInner = innerTop;
  let offset = 0;
  let minOffset = 0;
  let maxOffset = 0;
  let lastWeight = 0;
  let pad = 0;
  lines.forEach((line) => {
    line.outerY = lines.length === 1 ? height / 2 : lastOuter + line.thickness / 2;
    if (line.zeroValue) {
      lastOuter += line.thickness + spacing;
      return;
    }
    line.innerY = Math.min(
      innerBottom - line.thickness / 2,
      Math.max(innerTop + line.thickness / 2, lastInner + line.weight / 2),
    );
    lastOuter += line.thickness + spacing;
    lastInner += line.weight;

    // Parallel curves must stay >= t apart at their inflection point.
    const t = (lastWeight + line.weight) / 2;
    const dx = Math.max(1, 0.75 * curveWidth);
    const dy = 1.5 * (line.innerY - line.outerY);
    const angle = Math.atan2(dy, dx);
    if (Math.sin(angle) !== 0) {
      offset += Math.max(Math.min((t * (1 - Math.cos(angle))) / Math.sin(angle), t), -t);
    }
    line.offset = offset;
    minOffset = Math.min(minOffset, offset);
    maxOffset = Math.max(maxOffset, offset);
    pad = Math.max(pad, line.thickness / 2);
    lastWeight = line.weight;
  });
  return lines.map((line) => ({
    ...line,
    offset: line.offset - minOffset,
    curveBase: pad + (maxOffset - minOffset),
  }));
}

/**
 * The least span that fits `rows` at minimum spacing: sides share the larger of
 * this and the drawing height, so a busy side is not taller than its peer.
 */
export function bowtieMinimumSpan(rows: GraphRow[], total: number, combinedWeight: number, zeroThickness: number) {
  const weights = bowtieWeights(rows, total, combinedWeight);
  const thickness = rows.reduce(
    (sum, row, index) => sum + strandThickness(legValue(row), weights[index], combinedWeight, zeroThickness),
    0,
  );
  return thickness + MIN_SPACING * Math.max(0, rows.length - 1);
}

export type GraphTransaction = {
  chain: "bitcoin" | "liquid";
  inputs: GraphRow[];
  outputs: GraphRow[];
  fee: GraphRow | null;
};

/**
 * The legs a drawing shows. On Bitcoin the fee leads the outputs, as mempool
 * puts it first; on Liquid it is an output of its own and comes last.
 */
export function graphLayoutRows(graph: GraphTransaction) {
  const destinationRows = graph.fee
    ? graph.chain === "liquid"
      ? [...graph.outputs, graph.fee]
      : [graph.fee, ...graph.outputs]
    : graph.outputs;
  return { inputRows: graph.inputs, destinationRows };
}
