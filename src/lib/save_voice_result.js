import { writeFile } from "node:fs/promises";
import { createOutputFilePath, createTimestampText } from "./output_path.js";

/**
 * 생성된 음성을 output/voice 폴더의 오디오 파일로 저장한다.
 */
export async function saveGeneratedVoiceResult({ audioBuffer, outputFormat, sceneNumber, workspaceRootPath }) {
  const fileExtension = getAudioFileExtension(outputFormat);
  const sceneText = Number.isInteger(sceneNumber) ? `_scene_${sceneNumber}` : "";
  const fileName = `generated_voice${sceneText}_${createTimestampText()}.${fileExtension}`;
  const filePath = await createOutputFilePath({
    workspaceRootPath,
    outputType: "voice",
    fileName,
  });

  await writeFile(filePath, audioBuffer);

  return filePath;
}

/**
 * ElevenLabs output_format에서 저장 파일 확장자를 구한다.
 */
function getAudioFileExtension(outputFormat) {
  if (typeof outputFormat !== "string" || outputFormat.length === 0) {
    return "mp3";
  }

  const [codec] = outputFormat.split("_");

  return codec || "mp3";
}
