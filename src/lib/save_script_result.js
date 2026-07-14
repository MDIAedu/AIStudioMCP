import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const projectRootPath = path.resolve(currentDirectoryPath, "../..");

/**
 * 생성된 스크립트를 워크스페이스 루트 JSON 파일로 저장한다.
 */
export async function saveGeneratedScriptResult(scriptResult) {
  const fileName = `generated_script_${createTimestampText()}.json`;
  const filePath = path.join(projectRootPath, fileName);
  const fileContent = JSON.stringify(scriptResult, null, 2);

  await writeFile(filePath, `${fileContent}\n`, "utf8");

  return filePath;
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
