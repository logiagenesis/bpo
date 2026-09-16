export function extractJson(text: string): Record<string, string | number | boolean | string[]> | undefined {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? text.match(/\{[\s\S]*\}/)?.[0];
  if (!raw) return undefined;
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
    const out: Record<string, string | number | boolean | string[]> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") out[k] = val;
      else if (Array.isArray(val)) out[k] = val.map(String);
    }
    return out;
  } catch {
    return undefined;
  }
}

export function asStr(v: unknown) {
  return typeof v === "string" ? v : "";
}
export function asNum(v: unknown) {
  return typeof v === "number" ? v : Number(v) || 0;
}
export function asArr(v: unknown) {
  return Array.isArray(v) ? v.map(String) : [];
}
