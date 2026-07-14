const OPENAI_IMAGE_GENERATIONS_URL = "https://api.openai.com/v1/images/generations";
const OPENAI_IMAGE_MODEL = "gpt-image-2";
const OPENAI_IMAGE_OUTPUT_FORMAT = "png";

/**
 * OpenAI Image API에서 이미지 프롬프트 기반 이미지를 생성한다.
 */
export async function generateImageFromPrompt({ prompt, signal }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY 환경 변수가 설정되지 않았습니다. OpenAI API 키를 환경 변수로 추가한 뒤 다시 시도해주세요.",
    );
  }

  const response = await fetch(OPENAI_IMAGE_GENERATIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt,
      size: "1024x1024",
      output_format: OPENAI_IMAGE_OUTPUT_FORMAT,
    }),
    signal,
  });

  const responseJson = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(buildImageGenerationErrorMessage(response.status, responseJson));
  }

  const generatedImage = responseJson?.data?.[0];

  if (!generatedImage || typeof generatedImage.b64_json !== "string" || generatedImage.b64_json.length === 0) {
    throw new Error(
      "OpenAI 이미지 응답에 b64_json 데이터가 없습니다. 응답 형식이 예상과 다른지 확인해주세요.",
    );
  }

  return {
    model: responseJson?.model ?? OPENAI_IMAGE_MODEL,
    outputFormat: OPENAI_IMAGE_OUTPUT_FORMAT,
    imageBase64: generatedImage.b64_json,
  };
}

/**
 * 이미지 생성 응답 본문을 JSON으로 읽는다.
 */
async function readJsonResponse(response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(
      `OpenAI 이미지 응답 JSON 파싱에 실패했습니다. raw=${responseText}`,
      { cause: error },
    );
  }
}

/**
 * 이미지 생성 실패 응답을 사람이 이해할 수 있는 메시지로 바꾼다.
 */
function buildImageGenerationErrorMessage(status, responseJson) {
  const errorCode = responseJson?.error?.code;
  const errorMessage = responseJson?.error?.message;
  const moderationCategories = responseJson?.error?.moderation_details?.categories;

  if (errorCode === "moderation_blocked") {
    const categoryText = Array.isArray(moderationCategories) && moderationCategories.length > 0
      ? ` 차단 범주=${moderationCategories.join(", ")}`
      : "";

    return `OpenAI 이미지 생성 요청이 안전 정책으로 차단되었습니다.${categoryText} 프롬프트 표현을 조정한 뒤 다시 시도해주세요.`;
  }

  if (typeof errorMessage === "string" && errorMessage.length > 0) {
    return `OpenAI 이미지 생성 요청이 실패했습니다. status=${status}, message=${errorMessage}`;
  }

  return `OpenAI 이미지 생성 요청이 실패했습니다. status=${status}, body=${JSON.stringify(responseJson)}`;
}
