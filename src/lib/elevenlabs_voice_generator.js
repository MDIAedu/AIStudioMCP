const ELEVENLABS_TEXT_TO_SPEECH_BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const ELEVENLABS_DEFAULT_MODEL = "eleven_multilingual_v2";
const ELEVENLABS_DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";

/**
 * ElevenLabs Text to Speech API에서 대사 기반 음성을 생성한다.
 */
export async function generateVoiceFromNarration({
  narration,
  voiceId,
  modelId = ELEVENLABS_DEFAULT_MODEL,
  outputFormat = ELEVENLABS_DEFAULT_OUTPUT_FORMAT,
  signal,
}) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const resolvedVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY 환경 변수가 설정되지 않았습니다. ElevenLabs API 키를 환경 변수로 추가한 뒤 다시 시도해주세요.",
    );
  }

  if (!resolvedVoiceId) {
    throw new Error(
      "voice_id 입력값 또는 ELEVENLABS_VOICE_ID 환경 변수가 필요합니다. 사용할 ElevenLabs voice id를 지정한 뒤 다시 시도해주세요.",
    );
  }

  const requestUrl = new URL(`${ELEVENLABS_TEXT_TO_SPEECH_BASE_URL}/${encodeURIComponent(resolvedVoiceId)}`);
  requestUrl.searchParams.set("output_format", outputFormat);

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: narration,
      model_id: modelId,
    }),
    signal,
  });

  if (!response.ok) {
    const errorBody = await readErrorResponse(response);

    throw new Error(
      `ElevenLabs 음성 생성 요청이 실패했습니다. status=${response.status}, body=${errorBody}`,
    );
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());

  if (audioBuffer.length === 0) {
    throw new Error(
      "ElevenLabs 음성 응답이 비어 있습니다. voice_id, 대사, 모델 설정을 확인해주세요.",
    );
  }

  return {
    audioBase64: audioBuffer.toString("base64"),
    audioBuffer,
    contentType: response.headers.get("content-type") || "audio/mpeg",
    model: modelId,
    outputFormat,
    voiceId: resolvedVoiceId,
  };
}

/**
 * ElevenLabs 실패 응답 본문을 텍스트로 읽는다.
 */
async function readErrorResponse(response) {
  const responseText = await response.text();

  if (!responseText) {
    return "";
  }

  try {
    return JSON.stringify(JSON.parse(responseText));
  } catch {
    return responseText;
  }
}
