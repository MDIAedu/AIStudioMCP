import { z } from "zod";
import { generateVideoFromPrompt } from "../lib/evolink_video_generator.js";
import { resolveWorkspaceRootPath } from "../lib/output_path.js";
import { saveGeneratedVideoResult } from "../lib/save_video_result.js";

/**
 * 장면별 영상 프롬프트 기반 영상 생성 tool을 등록한다.
 */
export function registerGenerateVideoTool(server) {
  server.registerTool(
    "generate_video",
    {
      description:
        "Use this tool when you already have one scene video_prompt from the generated script and need one matching video from EvoLink.AI Kling text-to-video. It creates exactly one video result for the provided scene prompt and saves the completed video file when the task finishes.",
      inputSchema: {
        video_prompt: z
          .string()
          .min(1, "영상 프롬프트는 비워둘 수 없습니다.")
          .max(2500, "EvoLink Kling V3 text-to-video prompt는 최대 2500자까지 사용할 수 있습니다.")
          .describe("01-2의 장면 스크립트에서 가져온 video_prompt 또는 영상으로 만들 프롬프트입니다."),
        scene_number: z
          .number()
          .int("장면 번호는 정수여야 합니다.")
          .positive("장면 번호는 1 이상의 정수여야 합니다.")
          .optional()
          .describe("01-2의 장면 스크립트에 있는 장면 번호입니다. 저장 파일명을 구분하는 데 사용합니다."),
        duration: z
          .number()
          .int("영상 길이는 초 단위 정수여야 합니다.")
          .min(3, "EvoLink Kling V3 text-to-video duration은 최소 3초입니다.")
          .max(15, "EvoLink Kling V3 text-to-video duration은 최대 15초입니다.")
          .optional()
          .describe("생성할 영상 길이(초)입니다. 비우면 5초를 사용합니다."),
        aspect_ratio: z
          .enum(["16:9", "9:16", "1:1"])
          .optional()
          .describe("생성할 영상 화면비입니다. 비우면 16:9를 사용합니다."),
        quality: z
          .enum(["720p", "1080p", "4k"])
          .optional()
          .describe("생성할 영상 해상도 품질입니다. 비우면 720p를 사용합니다."),
        sound: z
          .enum(["on", "off"])
          .optional()
          .describe("Kling 모델의 사운드 효과 생성 여부입니다. 비우면 off를 사용합니다."),
      },
      outputSchema: {
        video_prompt: z
          .string()
          .describe("이번 영상 생성에 사용한 원본 영상 프롬프트입니다."),
        scene_number: z
          .number()
          .int()
          .optional()
          .describe("이번 영상 생성에 사용한 장면 번호입니다."),
        task_id: z
          .string()
          .describe("EvoLink.AI가 반환한 비동기 영상 생성 task id입니다."),
        status: z
          .string()
          .describe("완료 시점의 EvoLink task 상태입니다."),
        video_url: z
          .string()
          .describe("EvoLink task 완료 응답에 포함된 생성 영상 URL입니다."),
        content_type: z
          .string()
          .describe("저장한 영상 파일의 MIME 타입입니다."),
        duration: z
          .number()
          .int()
          .describe("이번 영상 생성 요청에 사용한 영상 길이(초)입니다."),
        aspect_ratio: z
          .string()
          .describe("이번 영상 생성 요청에 사용한 화면비입니다."),
        quality: z
          .string()
          .describe("이번 영상 생성 요청에 사용한 해상도 품질입니다."),
        sound: z
          .string()
          .describe("이번 영상 생성 요청에 사용한 사운드 효과 설정입니다."),
        model: z
          .string()
          .describe("이번 영상 생성에 사용된 EvoLink Kling 모델 식별자입니다."),
        saved_file_path: z
          .string()
          .describe("이번 호출 결과가 워크스페이스에 저장된 영상 파일 경로입니다."),
      },
    },
    async ({ video_prompt, scene_number, duration, aspect_ratio, quality, sound }, extra) => {
      try {
        const generatedVideo = await generateVideoFromPrompt({
          prompt: video_prompt,
          duration,
          aspectRatio: aspect_ratio,
          quality,
          sound,
          signal: extra.signal,
        });

        const workspaceRootPath = await resolveWorkspaceRootPath(extra);
        const savedFilePath = await saveGeneratedVideoResult({
          videoBuffer: generatedVideo.videoBuffer,
          contentType: generatedVideo.contentType,
          videoUrl: generatedVideo.videoUrl,
          sceneNumber: scene_number,
          workspaceRootPath,
        });

        const structuredContent = {
          video_prompt,
          scene_number,
          task_id: generatedVideo.taskId,
          status: generatedVideo.status,
          video_url: generatedVideo.videoUrl,
          content_type: generatedVideo.contentType,
          duration: generatedVideo.duration,
          aspect_ratio: generatedVideo.aspectRatio,
          quality: generatedVideo.quality,
          sound: generatedVideo.sound,
          model: generatedVideo.model,
          saved_file_path: savedFilePath,
        };

        return {
          content: [
            {
              type: "text",
              text: [
                `scene_number: ${scene_number ?? ""}`,
                `task_id: ${generatedVideo.taskId}`,
                `status: ${generatedVideo.status}`,
                `video_url: ${generatedVideo.videoUrl}`,
                `content_type: ${generatedVideo.contentType}`,
                `duration: ${generatedVideo.duration}`,
                `aspect_ratio: ${generatedVideo.aspectRatio}`,
                `quality: ${generatedVideo.quality}`,
                `sound: ${generatedVideo.sound}`,
                `model: ${generatedVideo.model}`,
                `saved_file_path: ${savedFilePath}`,
              ].join("\n"),
            },
          ],
          structuredContent,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "알 수 없는 오류로 영상 생성에 실패했습니다.",
            },
          ],
          isError: true,
        };
      }
    },
  );
}
