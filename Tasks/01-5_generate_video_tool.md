# Task 01-5 - 장면별 video_prompt 기반 영상 생성 tool

## 설명
01-2 단계에서 얻은 장면별 `video_prompt`를 입력으로 사용해 장면 하나당 영상 하나를 생성할 수 있어야 한다. 이번 단계는 `video_prompt`를 입력받아 EvoLink.AI의 Kling 모델로 영상을 생성하는 단일 MCP tool 범위만 다룬다.

## 구현 항목
- [x] 장면별 `video_prompt`를 입력받는 영상 생성용 MCP tool이 추가된다.
- [x] 장면 하나당 영상 하나가 생성된다.
- [x] EvoLink.AI의 Kling 모델을 사용해 영상을 생성한다.
- [x] 01-2 단계에서 생성된 스크립트의 `video_prompt`를 현재 단계 입력값으로 사용할 수 있다.
- [x] tool 호출 결과에 생성된 영상 결과 또는 저장 경로가 포함된다.

## 범위 밖
- 스크립트 생성 직후 영상 생성을 자동 연쇄 실행하는 기능
- 여러 장면의 전체 제작 과정을 한 번에 일괄 실행하는 기능
- 이미지 생성 결과를 입력으로 함께 사용하는 image-to-video 기능
- 음성, 자막, 배경음악을 영상에 합성하는 기능
- 영상 편집, 컷 연결, 해상도 변환 같은 후처리 기능

## 사전 전제
- `Tasks/01-2_generate_script_tool.md`의 장면별 스크립트 생성 결과에서 `video_prompt`를 얻을 수 있어야 한다.

## 수동 작업 (구현 후 구체화)
- 프로젝트 루트의 `.env` 파일에 `EVOLINK_API_KEY=실제_API_키값` 형식으로 EvoLink.AI API 키를 입력한다.
- EvoLink.AI 계정에서 `kling-v3-text-to-video` 모델 사용 권한과 충분한 크레딧이 있는지 확인한다.
- MCP 클라이언트 또는 inspector에서 이 저장소의 `npm start` 실행 구성을 사용하도록 서버를 연결한다.

## 완료 조건

### 에이전트 확인
- [x] 관련 코드 수정 완료
- [x] 로컬 정적 점검 또는 프로젝트 구조 기준 확인 완료
- [x] JavaScript/MCP tool 규칙 위반 없음
- [x] 현재 task 문서가 실제 구현 기준으로 갱신됨

### 결과 확인 (구현 후 구체화)
- [x] 프로젝트 루트에서 `npm start`로 MCP 서버를 실행한다.
- [x] MCP inspector 또는 MCP 클라이언트에서 tool 목록에 `generate_video`가 노출되는지 확인한다.
- [x] `generate_script` tool을 호출해 얻은 `scenes` 배열 항목의 `scene_number`와 `video_prompt` 값을 복사한다.
- [x] `generate_video` tool을 `scene_number`, `video_prompt` 값과 함께 호출했을 때 응답에 `video_prompt`, `scene_number`, `task_id`, `status`, `video_url`, `content_type`, `duration`, `aspect_ratio`, `quality`, `sound`, `model`, `saved_file_path`가 포함되는지 확인한다.
- [ ] `generate_video` tool 응답의 `saved_file_path` 경로가 MCP workspace root의 `output/video/` 하위 영상 파일이고, 재생할 수 있는지 확인한다.
- [x] `EVOLINK_API_KEY`를 설정하지 않은 상태에서 `generate_video` tool을 호출했을 때 원인이 드러나는 에러 메시지가 반환되는지 확인한다.
