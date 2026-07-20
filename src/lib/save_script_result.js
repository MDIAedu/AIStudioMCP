import { writeFile } from "node:fs/promises";
import { createOutputFilePath, createTimestampText } from "./output_path.js";

/**
 * 생성된 스크립트를 output/script 폴더의 JSON 파일로 저장한다.
 */
export async function saveGeneratedScriptResult({ scriptResult, workspaceRootPath }) {
  const fileName = `generated_script_${createTimestampText()}.json`;
  const filePath = await createOutputFilePath({
    workspaceRootPath,
    outputType: "script",
    fileName,
  });
  const fileContent = JSON.stringify(scriptResult, null, 2);

  await writeFile(filePath, `${fileContent}\n`, "utf8");

  return filePath;
}
