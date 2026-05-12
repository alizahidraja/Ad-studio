/** Small bitmap used as multiply grain overlay inside Konva. */
export function buildNoiseCanvas(seed: number, size = 240) {
  const canvas =
    typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!canvas) return null;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let s = seed % 2147483647 || 48271;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s % 1024) / 1024;
  };

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  const id = ctx.getImageData(0, 0, size, size);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const jitter = rand() * 70 - 35;
    const v = clamp(140 + jitter, 0, 255);
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = rand() > 0.35 ? Math.floor(rand() * 120 + 120) : 0;
  }
  ctx.putImageData(id, 0, 0);
  return canvas;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
