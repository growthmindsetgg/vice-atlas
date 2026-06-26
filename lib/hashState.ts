export type HashState = {
  z?: number;
  x?: number;
  y?: number;
  m?: string | null;
};

export function encodeHash(state: HashState): string {
  const parts: string[] = [];
  if (state.z != null) parts.push(`z=${state.z.toFixed(1)}`);
  if (state.x != null) parts.push(`x=${Math.round(state.x)}`);
  if (state.y != null) parts.push(`y=${Math.round(state.y)}`);
  if (state.m) parts.push(`m=${encodeURIComponent(state.m)}`);
  return parts.length ? `#${parts.join("&")}` : "";
}

export function decodeHash(hash: string): HashState {
  const out: HashState = {};
  const clean = hash.replace(/^#/, "");
  if (!clean) return out;
  for (const pair of clean.split("&")) {
    const [k, v] = pair.split("=");
    if (!v) continue;
    if (k === "z") out.z = Number(v);
    if (k === "x") out.x = Number(v);
    if (k === "y") out.y = Number(v);
    if (k === "m") out.m = decodeURIComponent(v);
  }
  return out;
}
