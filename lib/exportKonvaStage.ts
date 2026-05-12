import type { Stage as KonvaStage } from "konva/lib/Stage";

export async function exportStageToFile(
  stage: KonvaStage | null | undefined,
  filename = `azr-ad-${Date.now()}.png`,
) {
  if (!stage) return;
  await new Promise<void>((resolve, reject) => {
    stage.toBlob({
      pixelRatio: 2,
      mimeType: "image/png",
      quality: 1,
      callback(blob) {
        if (!blob) {
          reject(new Error("Konva export failed"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      },
    });
  });
}
