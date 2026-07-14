const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = "gpt-5.6";

/**
 * OpenAI Responses API에서 영상 장면 스크립트를 생성한다.
 */
export async function generateVideoScriptFromTopic({ topic, signal }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY 환경 변수가 설정되지 않았습니다. OpenAI API 키를 환경 변수로 추가한 뒤 다시 시도해주세요.",
    );
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "당신은 짧은 영상 기획을 위한 장면 스크립트 작성 도우미입니다.",
                "사용자가 입력한 영상 주제를 바탕으로 4개의 장면으로 구성된 스크립트를 작성하세요.",
                "각 장면에는 scene_description, image_prompt, video_prompt, narration을 반드시 포함하세요.",
                "장면 설명과 프롬프트는 서로 자연스럽게 이어져야 하며, 바로 이미지/영상 생성에 활용할 수 있을 정도로 구체적으로 작성하세요.",
                "narration은 실제 내레이션 문장처럼 자연스러운 한국어로 작성하세요.",
                "응답은 반드시 제공된 JSON 스키마에 맞추고, 스키마 밖 텍스트는 포함하지 마세요.",
              ].join("\n"),
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `영상 주제: ${topic}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "video_script",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              topic: {
                type: "string",
              },
              scenes: {
                type: "array",
                minItems: 4,
                maxItems: 4,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    scene_number: {
                      type: "integer",
                    },
                    scene_description: {
                      type: "string",
                    },
                    image_prompt: {
                      type: "string",
                    },
                    video_prompt: {
                      type: "string",
                    },
                    narration: {
                      type: "string",
                    },
                  },
                  required: [
                    "scene_number",
                    "scene_description",
                    "image_prompt",
                    "video_prompt",
                    "narration",
                  ],
                },
              },
            },
            required: ["topic", "scenes"],
          },
        },
      },
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenAI API 요청이 실패했습니다. status=${response.status}, body=${errorText}`,
    );
  }

  const responseJson = await response.json();
  const outputText = extractOutputText(responseJson);

  if (!outputText) {
    throw new Error(
      "OpenAI 응답에서 스크립트 텍스트를 찾지 못했습니다. 응답 형식이 예상과 다른지 확인해주세요.",
    );
  }

  let parsedScript;

  try {
    parsedScript = JSON.parse(outputText);
  } catch (error) {
    throw new Error(
      `OpenAI 응답 JSON 파싱에 실패했습니다. raw=${outputText}`,
      { cause: error },
    );
  }

  if (!Array.isArray(parsedScript.scenes) || parsedScript.scenes.length === 0) {
    throw new Error(
      "OpenAI 응답에 scenes 배열이 없거나 비어 있습니다. 프롬프트 또는 응답 스키마를 확인해주세요.",
    );
  }

  return {
    model: responseJson.model ?? OPENAI_MODEL,
    script: parsedScript,
  };
}

/**
 * Responses API 결과에서 첫 번째 텍스트 출력을 꺼낸다.
 */
function extractOutputText(responseJson) {
  if (!Array.isArray(responseJson.output)) {
    return null;
  }

  for (const outputItem of responseJson.output) {
    if (!Array.isArray(outputItem.content)) {
      continue;
    }

    for (const contentItem of outputItem.content) {
      if (contentItem.type === "output_text" && typeof contentItem.text === "string") {
        return contentItem.text;
      }
    }
  }

  return null;
}
