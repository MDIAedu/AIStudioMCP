const EVOLINK_VIDEO_GENERATIONS_URL = "https://api.evolink.ai/v1/videos/generations";
const EVOLINK_TASKS_BASE_URL = "https://api.evolink.ai/v1/tasks";
const EVOLINK_KLING_TEXT_TO_VIDEO_MODEL = "kling-v3-text-to-video";
const EVOLINK_DEFAULT_DURATION = 5;
const EVOLINK_DEFAULT_ASPECT_RATIO = "16:9";
const EVOLINK_DEFAULT_QUALITY = "720p";
const EVOLINK_DEFAULT_SOUND = "off";
const EVOLINK_POLL_INTERVAL_MS = 10000;
const EVOLINK_MAX_WAIT_MS = 600000;

/**
 * EvoLink.AI Kling text-to-video API에서 영상 프롬프트 기반 영상을 생성한다.
 */
export async function generateVideoFromPrompt({
  prompt,
  duration = EVOLINK_DEFAULT_DURATION,
  aspectRatio = EVOLINK_DEFAULT_ASPECT_RATIO,
  quality = EVOLINK_DEFAULT_QUALITY,
  sound = EVOLINK_DEFAULT_SOUND,
  signal,
}) {
  const apiKey = process.env.EVOLINK_API_KEY;

  if (!apiKey) {
    throw new Error(
      "EVOLINK_API_KEY 환경 변수가 설정되지 않았습니다. EvoLink.AI API 키를 환경 변수로 추가한 뒤 다시 시도해주세요.",
    );
  }

  const task = await createVideoGenerationTask({
    apiKey,
    prompt,
    duration,
    aspectRatio,
    quality,
    sound,
    signal,
  });
  const completedTask = await waitForVideoGenerationTask({
    apiKey,
    taskId: task.id,
    signal,
  });
  const videoUrl = findFirstResultUrl(completedTask);
  const downloadedVideo = await downloadGeneratedVideo({
    videoUrl,
    signal,
  });

  return {
    taskId: task.id,
    status: completedTask.status,
    videoUrl,
    videoBuffer: downloadedVideo.videoBuffer,
    contentType: downloadedVideo.contentType,
    duration,
    aspectRatio,
    quality,
    sound,
    model: completedTask.model || task.model || EVOLINK_KLING_TEXT_TO_VIDEO_MODEL,
  };
}

/**
 * EvoLink.AI에 영상 생성 task 생성을 요청한다.
 */
async function createVideoGenerationTask({
  apiKey,
  prompt,
  duration,
  aspectRatio,
  quality,
  sound,
  signal,
}) {
  const response = await fetch(EVOLINK_VIDEO_GENERATIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EVOLINK_KLING_TEXT_TO_VIDEO_MODEL,
      prompt,
      duration,
      aspect_ratio: aspectRatio,
      quality,
      sound,
    }),
    signal,
  });
  const responseJson = await readJsonResponse(response, "EvoLink 영상 생성 task 생성");

  if (!response.ok) {
    throw new Error(buildEvoLinkErrorMessage("EvoLink 영상 생성 task 생성 요청", response.status, responseJson));
  }

  if (!responseJson || typeof responseJson.id !== "string" || responseJson.id.length === 0) {
    throw new Error(
      `EvoLink 영상 생성 task 생성 응답에 task id가 없습니다. body=${JSON.stringify(responseJson)}`,
    );
  }

  return responseJson;
}

/**
 * EvoLink.AI 영상 생성 task가 완료될 때까지 상태를 조회한다.
 */
async function waitForVideoGenerationTask({ apiKey, taskId, signal }) {
  const startedAt = Date.now();

  while (Date.now() - startedAt <= EVOLINK_MAX_WAIT_MS) {
    const task = await getTaskStatus({
      apiKey,
      taskId,
      signal,
    });

    if (task.status === "completed") {
      return task;
    }

    if (task.status === "failed") {
      const errorMessage = task?.error?.message || "실패 원인이 응답에 포함되지 않았습니다.";

      throw new Error(
        `EvoLink 영상 생성 task가 실패했습니다. task_id=${taskId}, message=${errorMessage}`,
      );
    }

    await sleep(EVOLINK_POLL_INTERVAL_MS, signal);
  }

  throw new Error(
    `EvoLink 영상 생성 task가 제한 시간 안에 완료되지 않았습니다. task_id=${taskId}, max_wait_seconds=${EVOLINK_MAX_WAIT_MS / 1000}`,
  );
}

/**
 * EvoLink.AI task 상태를 조회한다.
 */
async function getTaskStatus({ apiKey, taskId, signal }) {
  const requestUrl = `${EVOLINK_TASKS_BASE_URL}/${encodeURIComponent(taskId)}`;
  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
  });
  const responseJson = await readJsonResponse(response, "EvoLink task 상태 조회");

  if (!response.ok) {
    throw new Error(buildEvoLinkErrorMessage("EvoLink task 상태 조회 요청", response.status, responseJson));
  }

  if (!responseJson || typeof responseJson.status !== "string") {
    throw new Error(
      `EvoLink task 상태 응답 형식이 예상과 다릅니다. task_id=${taskId}, body=${JSON.stringify(responseJson)}`,
    );
  }

  return responseJson;
}

/**
 * 완료된 task 응답에서 첫 번째 결과 URL을 찾는다.
 */
function findFirstResultUrl(task) {
  const [videoUrl] = Array.isArray(task.results) ? task.results : [];

  if (typeof videoUrl !== "string" || videoUrl.length === 0) {
    throw new Error(
      `EvoLink 완료 task 응답에 영상 결과 URL이 없습니다. task_id=${task.id}, body=${JSON.stringify(task)}`,
    );
  }

  return videoUrl;
}

/**
 * 완료된 EvoLink 영상 URL을 내려받는다.
 */
async function downloadGeneratedVideo({ videoUrl, signal }) {
  const response = await fetch(videoUrl, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `EvoLink 영상 파일 다운로드에 실패했습니다. status=${response.status}, url=${videoUrl}, body=${responseText}`,
    );
  }

  const videoBuffer = Buffer.from(await response.arrayBuffer());

  if (videoBuffer.length === 0) {
    throw new Error(
      `EvoLink 영상 파일 다운로드 결과가 비어 있습니다. url=${videoUrl}`,
    );
  }

  return {
    videoBuffer,
    contentType: response.headers.get("content-type") || "video/mp4",
  };
}

/**
 * JSON 응답 본문을 읽는다.
 */
async function readJsonResponse(response, actionName) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(
      `${actionName} 응답 JSON 파싱에 실패했습니다. raw=${responseText}`,
      { cause: error },
    );
  }
}

/**
 * EvoLink 실패 응답을 사람이 이해할 수 있는 메시지로 바꾼다.
 */
function buildEvoLinkErrorMessage(actionName, status, responseJson) {
  const errorCode = responseJson?.error?.code;
  const errorMessage = responseJson?.error?.message;

  if (typeof errorMessage === "string" && errorMessage.length > 0) {
    const codeText = typeof errorCode === "string" && errorCode.length > 0
      ? `, code=${errorCode}`
      : "";

    return `${actionName}이 실패했습니다. status=${status}${codeText}, message=${errorMessage}`;
  }

  return `${actionName}이 실패했습니다. status=${status}, body=${JSON.stringify(responseJson)}`;
}

/**
 * 지정한 시간만큼 기다리며 취소 신호를 처리한다.
 */
function sleep(ms, signal) {
  if (signal?.aborted) {
    return Promise.reject(new Error("EvoLink 영상 생성 대기 중 요청이 취소되었습니다."));
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(new Error("EvoLink 영상 생성 대기 중 요청이 취소되었습니다."));
      },
      { once: true },
    );
  });
}
