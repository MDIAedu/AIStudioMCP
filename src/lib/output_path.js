import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ListRootsResultSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP 클라이언트가 제공한 첫 번째 workspace root 경로를 구한다.
 */
export async function resolveWorkspaceRootPath(extra) {
  try {
    const rootsResult = await extra.sendRequest(
      {
        method: "roots/list",
      },
      ListRootsResultSchema,
    );
    const [workspaceRoot] = rootsResult.roots;

    if (workspaceRoot?.uri?.startsWith("file://")) {
      return fileURLToPath(workspaceRoot.uri);
    }
  } catch {
    // roots/list를 지원하지 않는 MCP 클라이언트에서는 실행 위치를 기준으로 저장한다.
  }

  return process.cwd();
}

/**
 * workspace의 결과물 타입별 output 하위 폴더를 만들고 저장할 파일 경로를 반환한다.
 */
export async function createOutputFilePath({ workspaceRootPath, outputType, fileName }) {
  if (typeof workspaceRootPath !== "string" || workspaceRootPath.length === 0) {
    throw new Error("workspaceRootPath는 비워둘 수 없습니다.");
  }

  if (typeof outputType !== "string" || outputType.length === 0) {
    throw new Error("outputType은 비워둘 수 없습니다.");
  }

  if (typeof fileName !== "string" || fileName.length === 0) {
    throw new Error("fileName은 비워둘 수 없습니다.");
  }

  const outputDirectoryPath = path.join(workspaceRootPath, "output", outputType);

  await mkdir(outputDirectoryPath, { recursive: true });

  return path.join(outputDirectoryPath, fileName);
}

/**
 * 파일명에 넣을 안전한 타임스탬프 문자열을 만든다.
 */
export function createTimestampText() {
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
