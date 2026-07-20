import { z } from "zod";
import { generateVideoScriptFromTopic } from "../lib/openai_script_generator.js";
import { resolveWorkspaceRootPath } from "../lib/output_path.js";
import { saveGeneratedScriptResult } from "../lib/save_script_result.js";

const sceneSchema = z.object({
  scene_number: z.number().int().describe("1부터 시작하는 장면 순서입니다."),
  scene_description: z
    .string()
    .describe("이 장면에서 실제로 보여줄 핵심 상황과 연출 설명입니다."),
  image_prompt: z
    .string()
    .describe("이 장면을 대표하는 이미지를 생성할 때 사용할 구체적인 프롬프트입니다."),
  video_prompt: z
    .string()
    .describe("이 장면을 영상으로 생성할 때 사용할 구체적인 프롬프트입니다."),
  narration: z
    .string()
    .describe("이 장면에서 사용할 자연스러운 한국어 내레이션 문장입니다."),
});

/**
 * 영상 주제 기반 장면 스크립트 생성 tool을 등록한다.
 */
export function registerGenerateScriptTool(server) {
  server.registerTool(
    "generate_script",
    {
      description:
        "Use this tool when you need a scene-by-scene video script from a user-provided topic. It returns a structured script with scene description, image prompt, video prompt, and narration for each scene, generated through the OpenAI API.",
      inputSchema: {
        topic: z
          .string()
          .min(1, "영상 주제는 비워둘 수 없습니다.")
          .describe("장면 스크립트를 생성할 영상 주제입니다."),
      },
      outputSchema: {
        topic: z.string().describe("스크립트를 생성한 원본 영상 주제입니다."),
        scenes: z
          .array(sceneSchema)
          .min(1)
          .describe("장면별 설명, 이미지 프롬프트, 영상 프롬프트, 내레이션 목록입니다."),
        model: z
          .string()
          .describe("이번 스크립트 생성에 사용된 OpenAI 모델 식별자입니다."),
        saved_file_path: z
          .string()
          .describe("이번 호출 결과가 워크스페이스에 저장된 JSON 파일 경로입니다."),
      },
    },
    async ({ topic }, extra) => {
      try {
        const { model, script } = await generateVideoScriptFromTopic({
          topic,
          signal: extra.signal,
        });

        const workspaceRootPath = await resolveWorkspaceRootPath(extra);
        const savedFilePath = await saveGeneratedScriptResult({
          scriptResult: {
            topic: script.topic,
            scenes: script.scenes,
            model,
          },
          workspaceRootPath,
        });

        const structuredContent = {
          topic: script.topic,
          scenes: script.scenes,
          model,
          saved_file_path: savedFilePath,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(structuredContent, null, 2),
            },
          ],
          structuredContent,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "알 수 없는 오류로 스크립트 생성에 실패했습니다.",
            },
          ],
          isError: true,
        };
      }
    },
  );
}
