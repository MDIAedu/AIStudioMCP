import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const projectRootPath = path.resolve(currentDirectoryPath, "../..");
const envFilePath = path.join(projectRootPath, ".env");

/**
 * 프로젝트 루트의 .env 파일을 읽어 process.env에 반영한다.
 */
export function loadEnvironmentVariables() {
  if (!existsSync(envFilePath)) {
    return;
  }

  const envFileContent = readFileSync(envFilePath, "utf8");
  const envLines = envFileContent.split(/\r?\n/u);

  for (const rawLine of envLines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex < 1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = stripWrappingQuotes(rawValue);
  }
}

/**
 * .env 값 양끝에 감싼 작은따옴표 또는 큰따옴표를 제거한다.
 */
function stripWrappingQuotes(value) {
  if (value.length < 2) {
    return value;
  }

  const startsWithDoubleQuote = value.startsWith("\"") && value.endsWith("\"");
  const startsWithSingleQuote = value.startsWith("'") && value.endsWith("'");

  if (startsWithDoubleQuote || startsWithSingleQuote) {
    return value.slice(1, -1);
  }

  return value;
}
