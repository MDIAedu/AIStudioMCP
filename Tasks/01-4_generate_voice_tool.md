# Task 01-4 - 장면별 대사 기반 음성 생성 tool

## 설명
01-2 단계에서 얻은 장면별 대사를 입력으로 사용해 장면 하나당 음성 하나를 생성할 수 있어야 한다. 이번 단계는 대사를 입력받아 ElevenLabs API로 음성을 생성하는 단일 MCP tool 범위만 다룬다.

## 구현 항목
- [x] 장면별 대사를 입력받는 음성 생성용 MCP tool이 추가된다.
- [x] 장면 하나당 음성 하나가 생성된다.
- [x] ElevenLabs API를 사용해 음성을 생성한다.
- [x] 01-2 단계에서 생성된 스크립트의 대사를 현재 단계 입력값으로 사용할 수 있다.
- [x] tool 호출 결과에 생성된 음성 결과 또는 저장 경로가 포함된다.

## 범위 밖
- 스크립트 생성 직후 음성 생성을 자동 연쇄 실행하는 기능
- 여러 장면의 전체 제작 과정을 한 번에 일괄 실행하는 기능
- 영상 생성 tool 구현
- 음성 편집, 믹싱, 배경음악 추가 같은 후처리 기능
- 화자별 보이스 캐스팅 또는 감정별 보이스 자동 선택 기능

## 사전 전제
- `Tasks/01-2_generate_script_tool.md`의 장면별 스크립트 생성 결과에서 대사를 얻을 수 있어야 한다.

## 수동 작업 (구현 후 구체화)
- 프로젝트 루트의 `.env` 파일에 `ELEVENLABS_API_KEY=실제_API_키값` 형식으로 ElevenLabs API 키를 입력한다.
- `generate_voice` 호출마다 `voice_id`를 직접 입력하지 않으려면 프로젝트 루트의 `.env` 파일에 `ELEVENLABS_VOICE_ID=사용할_voice_id` 형식으로 기본 voice id를 입력한다.
- MCP 클라이언트 또는 inspector에서 이 저장소의 `npm start` 실행 구성을 사용하도록 서버를 연결한다.

## 완료 조건

### 에이전트 확인
- [x] 관련 코드 수정 완료
- [x] 로컬 정적 점검 또는 프로젝트 구조 기준 확인 완료
- [x] JavaScript/MCP tool 규칙 위반 없음
- [x] 현재 task 문서가 실제 구현 기준으로 갱신됨

### 결과 확인 (구현 후 구체화)
- [x] 프로젝트 루트에서 `npm start`로 MCP 서버를 실행한다.
- [x] MCP inspector 또는 MCP 클라이언트에서 tool 목록에 `generate_voice`가 노출되는지 확인한다.
- [x] `generate_script` tool을 호출해 얻은 `scenes` 배열 항목의 `scene_number`와 `narration` 값을 복사한다.
- [x] `generate_voice` tool을 `scene_number`, `narration`, `voice_id` 값과 함께 호출했을 때 응답에 `narration`, `scene_number`, `voice_id`, `audio_base64`, `content_type`, `output_format`, `model`, `saved_file_path`가 포함되는지 확인한다.
- [x] `voice_id`를 생략하고 `ELEVENLABS_VOICE_ID`가 설정된 상태에서 `generate_voice` tool을 호출했을 때 음성이 생성되는지 확인한다.
- [x] `generate_voice` tool 응답의 `audio_base64`를 base64로 디코딩했을 때 실제 오디오 파일로 재생되는지 확인한다.
- [x] `generate_voice` tool을 호출했을 때 응답의 `saved_file_path` 경로에 음성 파일이 실제 생성되고, 재생할 수 있는지 확인한다.
- [x] `ELEVENLABS_API_KEY`를 설정하지 않은 상태에서 `generate_voice` tool을 호출했을 때 원인이 드러나는 에러 메시지가 반환되는지 확인한다.
- [x] `voice_id` 입력값과 `ELEVENLABS_VOICE_ID` 환경 변수가 모두 없는 상태에서 `generate_voice` tool을 호출했을 때 원인이 드러나는 에러 메시지가 반환되는지 확인한다.
