export function toJsonSafe(value) {
  if (typeof value === "bigint") {
    return Number(value);            // <- si prefieres string: value.toString()
  }

  if (Array.isArray(value)) {
    return value.map(toJsonSafe);
  }

  if (value !== null && typeof value === "object") {
    const out = {};
    for (const key in value) {
      out[key] = toJsonSafe(value[key]);
    }
    return out;
  }

  return value;
}
