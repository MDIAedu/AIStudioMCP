/**
 * 서버가 정상적으로 떠 있는지 확인하는 최소 ping tool을 등록한다.
 */
export function registerPingTool(server) {
  server.tool(
    "ping",
    "Use this tool to confirm the AIStudioMCP server is connected and responsive. Returns a short health-check message when the MCP server is running normally.",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: "AIStudioMCP server is running.",
          },
        ],
      };
    },
  );
}
