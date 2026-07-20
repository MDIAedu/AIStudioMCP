import { writeFile } from "node:fs/promises";
import { createOutputFilePath, createTimestampText } from "./output_path.js";

/**
 * 생성된 이미지를 output/image 폴더의 PNG 파일로 저장한다.
 */
export async function saveGeneratedImageResult({ imageBase64, outputFormat, workspaceRootPath }) {
  const fileName = `generated_image_${createTimestampText()}.${outputFormat}`;
  const filePath = await createOutputFilePath({
    workspaceRootPath,
    outputType: "image",
    fileName,
  });
  const imageBytes = Buffer.from(imageBase64, "base64");

  await writeFile(filePath, imageBytes);

  return filePath;
}
