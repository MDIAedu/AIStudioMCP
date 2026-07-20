import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const projectRootPath = path.resolve(currentDirectoryPath, "../..");

/**
 * 생성된 영상을 워크스페이스 루트 파일로 저장한다.
 */
export async function saveGeneratedVideoResult({ videoBuffer, contentType, videoUrl, sceneNumber }) {
  const fileExtension = getVideoFileExtension({ contentType, videoUrl });
  const sceneText = Number.isInteger(sceneNumber) ? `_scene_${sceneNumber}` : "";
  const fileName = `generated_video${sceneText}_${createTimestampText()}.${fileExtension}`;
  const filePath = path.join(projectRootPath, fileName);

  await writeFile(filePath, videoBuffer);

  return filePath;
}

/**
 * 응답 MIME 타입과 URL에서 영상 저장 파일 확장자를 구한다.
 */
function getVideoFileExtension({ contentType, videoUrl }) {
  if (typeof contentType === "string" && contentType.includes("mp4")) {
    return "mp4";
  }

  if (typeof contentType === "string" && contentType.includes("webm")) {
    return "webm";
  }

  try {
    const urlPath = new URL(videoUrl).pathname;
    const extension = path.extname(urlPath).replace(".", "");

    return extension || "mp4";
  } catch {
    return "mp4";
  }
}

/**
 * 파일명에 넣을 안전한 타임스탬프 문자열을 만든다.
 */
function createTimestampText() {
  const now = new Date();

  return [
    now.getFullYear(),
    padNumber(now.getMonth() + 1),
    padNumber(now.getDate()),
    "_",
    padNumber(now.getHours()),
    padNumber(now.getMinutes()),
    padNumber(now.getSeconds()),
  ].join("");
}

/**
 * 두 자리 숫자 텍스트로 맞춘다.
 */
function padNumber(value) {
  return String(value).padStart(2, "0");
}
