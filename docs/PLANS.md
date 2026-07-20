# Plans

## 목적

이 문서는 현재 진행 중인 단계 상태와 최근 작업 흐름을 빠르게 확인하기 위한 기록 문서입니다.

## 작업리스트
| 단계 | Task 문서 | 해야 할 항목 | 상태 |
| --- | --- | --- | --- |
| 01-1 | [Tasks/01-1_mcp_server_skeleton.md](../Tasks/01-1_mcp_server_skeleton.md) | Node.js와 `@modelcontextprotocol/sdk` 기반 MCP 서버를 실행하고, 클라이언트 연결 및 서버 기동 확인용 최소 tool 1개를 노출한다. | 완료 |
| 01-2 | [Tasks/01-2_generate_script_tool.md](../Tasks/01-2_generate_script_tool.md) | 영상 주제를 입력받아 장면 설명, 이미지 프롬프트, 영상 프롬프트, 나레이션으로 구성된 장면별 스크립트를 생성하는 OpenAI 기반 tool 1개를 추가한다. | 완료 |
| 01-3 | [Tasks/01-3_generate_image_tool.md](../Tasks/01-3_generate_image_tool.md) | 01-2에서 얻은 이미지 프롬프트를 입력받아 OpenAI API로 이미지를 생성하는 MCP tool 1개를 추가한다. | 완료 |
| 01-4 | [Tasks/01-4_generate_voice_tool.md](../Tasks/01-4_generate_voice_tool.md) | 01-2에서 얻은 장면별 대사를 입력받아 ElevenLabs API로 장면 하나당 음성 하나를 생성하는 MCP tool 1개를 추가한다. | 진행중 |


## 상태 범례

- `예정`: 아직 시작 전
- `진행중`: 구현 중이거나, 구현 후 사용자 수동 작업 또는 결과 확인을 기다리는 상태
- `완료`: 구현 및 현재 확인 모드 기준 확인 완료
- `차단됨`: 오류, 필수 정보 누락, 외부 의존성 문제 등으로 정상 진행이 막힌 상태

## 최근 작업 로그
- 2026-07-20: `node --check src/server.js`, `node --check src/tools/generate_voice.js`, `node --check src/lib/elevenlabs_voice_generator.js`, `node --check src/lib/save_voice_result.js`로 정적 점검을 완료하고, ElevenLabs API 키 및 voice id 누락 에러 메시지를 로컬 호출로 확인함.
- 2026-07-20: Task 01-4 구현으로 `src/tools/generate_voice.js`, `src/lib/elevenlabs_voice_generator.js`, `src/lib/save_voice_result.js`를 추가하고 `src/server.js`에 `generate_voice` tool 등록을 연결함.
- 2026-07-20: ElevenLabs Text to Speech API로 단일 장면 대사를 MP3 음성으로 생성하고, 응답에 `audio_base64`, `content_type`, `output_format`, `model`, `voice_id`, `saved_file_path`를 포함하도록 구성함.
- 2026-07-20: Task 01-4 구현을 시작하며 `docs/PLANS.md` 상태를 진행중으로 갱신함.
- 2026-07-20: 장면별 대사를 바탕으로 ElevenLabs API 음성을 생성하는 01-4 단계를 `docs/PLANS.md` 작업리스트에 예정 상태로 추가하고 task 문서 생성을 준비함.
- 2026-07-14: `generate_image` tool 호출 결과를 워크스페이스 루트의 타임스탬프 PNG 파일로 저장하고, 응답에 `saved_file_path`를 포함하도록 `src/lib/save_image_result.js`와 tool 출력 스키마를 갱신함.
- 2026-07-14: Task 01-3 구현으로 `src/tools/generate_image.js`, `src/lib/openai_image_generator.js`를 추가하고 `src/server.js`에 `generate_image` tool 등록을 연결함.
- 2026-07-14: OpenAI Image API `images/generations` 엔드포인트로 단일 이미지 생성 요청을 보내고, base64 PNG 응답과 정책 차단·응답 파싱 실패 에러를 구체적으로 반환하도록 구성함.
- 2026-07-14: `generate_script` tool 호출 결과를 워크스페이스 루트의 타임스탬프 JSON 파일로 저장하고, 응답에 `saved_file_path`를 포함하도록 `src/lib/save_script_result.js`와 tool 출력 스키마를 갱신함.
- 2026-07-14: 프로젝트 루트 `.env` 파일의 `OPENAI_API_KEY` 값을 서버 시작 시 읽어 `process.env`에 반영하도록 `src/lib/load_env.js`를 추가하고 `src/server.js`에 연결함.
- 2026-07-14: Task 01-2 구현으로 `src/tools/generate_script.js`, `src/lib/openai_script_generator.js`를 추가하고 `src/server.js`에 `generate_script` tool 등록을 연결함.
- 2026-07-14: OpenAI Responses API의 `json_schema` 형식으로 4개 장면 스크립트를 생성하고, `OPENAI_API_KEY` 누락·응답 실패·JSON 파싱 실패를 구체적인 에러 메시지로 반환하도록 구성함.
- 2026-07-14: `node --check src/server.js`, `node --check src/tools/generate_script.js`, `node --check src/lib/openai_script_generator.js`로 정적 점검을 완료하고 Task 01-2 문서와 구조 문서를 실제 구현 기준으로 갱신함.
- 2026-07-14: Task 01-1 구현으로 `package.json`, `src/server.js`, `src/tools/ping.js`를 추가해 `AIStudioMCP` 서버와 `ping` tool 기본 골격을 구성함.
- 2026-07-14: `docs/ARCHITECTURE.md`와 Task 01-1 문서를 실제 생성 파일, 수동 작업, 결과 확인 절차 기준으로 갱신함.
- 2026-07-14: `npm.cmd install`, `node --check src/server.js`, `node --check src/tools/ping.js`, 짧은 런타임 기동 점검으로 기본 실행 가능 상태를 확인함.
