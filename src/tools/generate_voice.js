import { z } from "zod";
import { generateVoiceFromNarration } from "../lib/elevenlabs_voice_generator.js";
import { saveGeneratedVoiceResult } from "../lib/save_voice_result.js";

/**
 * 장면별 대사 기반 음성 생성 tool을 등록한다.
 */
export function registerGenerateVoiceTool(server) {
  server.registerTool(
    "generate_voice",
    {
      description:
        "Use this tool when you already have one scene narration/dialogue from the generated script and need one matching voice audio file from the ElevenLabs Text to Speech API. It creates exactly one audio result for the provided scene narration.",
      inputSchema: {
        narration: z
          .string()
          .min(1, "대사는 비워둘 수 없습니다.")
          .describe("01-2의 장면 스크립트에서 가져온 narration 또는 음성으로 만들 대사입니다."),
        scene_number: z
          .number()
          .int("장면 번호는 정수여야 합니다.")
          .positive("장면 번호는 1 이상의 정수여야 합니다.")
          .optional()
          .describe("01-2의 장면 스크립트에 있는 장면 번호입니다. 저장 파일명을 구분하는 데 사용합니다."),
        voice_id: z
          .string()
          .min(1, "voice_id는 비워둘 수 없습니다.")
          .optional()
          .describe("사용할 ElevenLabs voice id입니다. 비우면 ELEVENLABS_VOICE_ID 환경 변수를 사용합니다."),
      },
      outputSchema: {
        narration: z
          .string()
          .describe("이번 음성 생성에 사용한 원본 대사입니다."),
        scene_number: z
          .number()
          .int()
          .optional()
          .describe("이번 음성 생성에 사용한 장면 번호입니다."),
        voice_id: z
          .string()
          .describe("이번 음성 생성에 사용된 ElevenLabs voice id입니다."),
        audio_base64: z
          .string()
          .describe("ElevenLabs API가 반환한 음성 파일의 base64 문자열입니다."),
        content_type: z
          .string()
          .describe("이번 음성 생성 결과의 MIME 타입입니다."),
        output_format: z
          .string()
          .describe("이번 음성 생성 결과의 ElevenLabs output_format 값입니다."),
        model: z
          .string()
          .describe("이번 음성 생성에 사용된 ElevenLabs 모델 식별자입니다."),
        saved_file_path: z
          .string()
          .describe("이번 호출 결과가 워크스페이스에 저장된 음성 파일 경로입니다."),
      },
    },
    async ({ narration, scene_number, voice_id }, extra) => {
      try {
        const generatedVoice = await generateVoiceFromNarration({
          narration,
          voiceId: voice_id,
          signal: extra.signal,
        });

        const savedFilePath = await saveGeneratedVoiceResult({
          audioBuffer: generatedVoice.audioBuffer,
          outputFormat: generatedVoice.outputFormat,
          sceneNumber: scene_number,
        });

        const structuredContent = {
          narration,
          scene_number,
          voice_id: generatedVoice.voiceId,
          audio_base64: generatedVoice.audioBase64,
          content_type: generatedVoice.contentType,
          output_format: generatedVoice.outputFormat,
          model: generatedVoice.model,
          saved_file_path: savedFilePath,
        };

        return {
          content: [
            {
              type: "text",
              text: [
                `scene_number: ${scene_number ?? ""}`,
                `voice_id: ${generatedVoice.voiceId}`,
                `content_type: ${generatedVoice.contentType}`,
                `output_format: ${generatedVoice.outputFormat}`,
                `model: ${generatedVoice.model}`,
                `saved_file_path: ${savedFilePath}`,
              ].join("\n"),
            },
            {
              type: "audio",
              data: generatedVoice.audioBase64,
              mimeType: generatedVoice.contentType,
            },
          ],
          structuredContent,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "알 수 없는 오류로 음성 생성에 실패했습니다.",
            },
          ],
          isError: true,
        };
      }
    },
  );
}
