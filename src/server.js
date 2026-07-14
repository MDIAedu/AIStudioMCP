import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPingTool } from "./tools/ping.js";

/**
 * MCP 서버 인스턴스를 만들고 기본 tool을 등록한다.
 */
function createServer() {
  const server = new McpServer({
    name: "AIStudioMCP",
    version: "0.1.0",
  });

  registerPingTool(server);

  return server;
}

/**
 * stdio transport로 MCP 서버를 연결해 클라이언트가 접속할 수 있게 한다.
 */
async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error("MCP 서버 시작 실패:", error);
  process.exit(1);
});
