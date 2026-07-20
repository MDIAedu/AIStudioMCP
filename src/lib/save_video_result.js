import { writeFile } from "node:fs/promises";
import path from "node:path";
import { createOutputFilePath, createTimestampText } from "./output_path.js";

/**
 * 생성된 영상을 output/video 폴더의 영상 파일로 저장한다.
 */
export async function saveGeneratedVideoResult({ videoBuffer, contentType, videoUrl, sceneNumber, workspaceRootPath }) {
  const fileExtension = getVideoFileExtension({ contentType, videoUrl });
  const sceneText = Number.isInteger(sceneNumber) ? `_scene_${sceneNumber}` : "";
  const fileName = `generated_video${sceneText}_${createTimestampText()}.${fileExtension}`;
  const filePath = await createOutputFilePath({
    workspaceRootPath,
    outputType: "video",
    fileName,
  });

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
