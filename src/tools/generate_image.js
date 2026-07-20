import { z } from "zod";
import { generateImageFromPrompt } from "../lib/openai_image_generator.js";
import { resolveWorkspaceRootPath } from "../lib/output_path.js";
import { saveGeneratedImageResult } from "../lib/save_image_result.js";

/**
 * 이미지 프롬프트 기반 이미지 생성 tool을 등록한다.
 */
export function registerGenerateImageTool(server) {
  server.registerTool(
    "generate_image",
    {
      description:
        "Use this tool when you already have an image prompt and need one generated image from the OpenAI Image API. It takes a single prompt string and returns the generated image as base64 text with the model and output format used.",
      inputSchema: {
        image_prompt: z
          .string()
          .min(1, "이미지 프롬프트는 비워둘 수 없습니다.")
          .describe("01-2의 장면 스크립트에서 가져오거나 직접 작성한 이미지 생성 프롬프트입니다."),
      },
      outputSchema: {
        image_prompt: z
          .string()
          .describe("이번 이미지 생성에 사용한 원본 이미지 프롬프트입니다."),
        image_base64: z
          .string()
          .describe("OpenAI Image API가 반환한 PNG 이미지의 base64 문자열입니다."),
        output_format: z
          .string()
          .describe("이번 이미지 생성 결과의 파일 형식입니다."),
        model: z
          .string()
          .describe("이번 이미지 생성에 사용된 OpenAI 모델 식별자입니다."),
        saved_file_path: z
          .string()
          .describe("이번 호출 결과가 워크스페이스에 저장된 이미지 파일 경로입니다."),
      },
    },
    async ({ image_prompt }, extra) => {
      try {
        const generatedImage = await generateImageFromPrompt({
          prompt: image_prompt,
          signal: extra.signal,
        });

        const workspaceRootPath = await resolveWorkspaceRootPath(extra);
        const savedFilePath = await saveGeneratedImageResult({
          imageBase64: generatedImage.imageBase64,
          outputFormat: generatedImage.outputFormat,
          workspaceRootPath,
        });

        const structuredContent = {
          image_prompt,
          image_base64: generatedImage.imageBase64,
          output_format: generatedImage.outputFormat,
          model: generatedImage.model,
          saved_file_path: savedFilePath,
        };

        return {
          content: [
            {
              type: "text",
              text: [
                `image_prompt: ${image_prompt}`,
                `output_format: ${generatedImage.outputFormat}`,
                `model: ${generatedImage.model}`,
                `saved_file_path: ${savedFilePath}`,
              ].join("\n"),
            },
            {
              type: "image",
              data: generatedImage.imageBase64,
              mimeType: `image/${generatedImage.outputFormat}`,
            },
          ],
          structuredContent,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "알 수 없는 오류로 이미지 생성에 실패했습니다.",
            },
          ],
          isError: true,
        };
      }
    },
  );
}
