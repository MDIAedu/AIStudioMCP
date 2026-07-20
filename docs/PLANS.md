# Plans

## 목적

이 문서는 현재 진행 중인 단계 상태와 최근 작업 흐름을 빠르게 확인하기 위한 기록 문서입니다.

## 작업리스트
| 단계 | Task 문서 | 해야 할 항목 | 상태 |
| --- | --- | --- | --- |
| 01-1 | [Tasks/01-1_mcp_server_skeleton.md](../Tasks/01-1_mcp_server_skeleton.md) | Node.js와 `@modelcontextprotocol/sdk` 기반 MCP 서버를 실행하고, 클라이언트 연결 및 서버 기동 확인용 최소 tool 1개를 노출한다. | 완료 |
| 01-2 | [Tasks/01-2_generate_script_tool.md](../Tasks/01-2_generate_script_tool.md) | 영상 주제를 입력받아 장면 설명, 이미지 프롬프트, 영상 프롬프트, 나레이션으로 구성된 장면별 스크립트를 생성하는 OpenAI 기반 tool 1개를 추가한다. | 진행중 |
| 01-3 | [Tasks/01-3_generate_image_tool.md](../Tasks/01-3_generate_image_tool.md) | 01-2에서 얻은 이미지 프롬프트를 입력받아 OpenAI API로 이미지를 생성하는 MCP tool 1개를 추가한다. | 진행중 |
| 01-4 | [Tasks/01-4_generate_voice_tool.md](../Tasks/01-4_generate_voice_tool.md) | 01-2에서 얻은 장면별 대사를 입력받아 ElevenLabs API로 장면 하나당 음성 하나를 생성하는 MCP tool 1개를 추가한다. | 진행중 |
| 01-5 | [Tasks/01-5_generate_video_tool.md](../Tasks/01-5_generate_video_tool.md) | 01-2에서 얻은 video_prompt를 입력받아 EvoLink.AI의 Kling 모델로 장면 하나당 영상 하나를 생성하는 MCP tool 1개를 추가한다. | 진행중 |


## 상태 범례

- `예정`: 아직 시작 전
- `진행중`: 구현 중이거나, 구현 후 사용자 수동 작업 또는 결과 확인을 기다리는 상태
- `완료`: 구현 및 현재 확인 모드 기준 확인 완료
- `차단됨`: 오류, 필수 정보 누락, 외부 의존성 문제 등으로 정상 진행이 막힌 상태

## 최근 작업 로그
- 2026-07-20: `node --check`로 변경된 output path/save/tool 파일을 점검하고, fake MCP `roots/list` 응답으로 임시 workspace root 아래 `output/script`, `output/image`, `output/voice`, `output/video` 저장 경로가 생성되는지 확인한 뒤 임시 폴더를 정리함.
- 2026-07-20: 생성 결과 저장 기준을 서버 프로젝트 폴더에서 MCP `roots/list`가 제공하는 workspace root로 변경하고, roots를 제공하지 않는 클라이언트에서는 실행 위치를 fallback으로 사용하도록 수정함.
- 2026-07-20: `node --check`로 `src/lib/output_path.js`와 4개 저장 helper를 점검하고, 더미 저장 호출로 `output/script`, `output/image`, `output/voice`, `output/video` 폴더 자동 생성과 저장 경로를 확인한 뒤 더미 파일을 정리함.
- 2026-07-20: script/image/video/voice 생성 결과 저장 위치를 `output/script`, `output/image`, `output/video`, `output/voice` 하위 폴더로 변경하고, 저장 시 폴더가 없으면 자동 생성되도록 `src/lib/output_path.js`를 추가함.
- 2026-07-20: `node --check src/server.js`, `node --check src/tools/generate_video.js`, `node --check src/lib/evolink_video_generator.js`, `node --check src/lib/save_video_result.js`로 정적 점검을 완료하고, EvoLink API 키 누락 에러 메시지를 로컬 호출로 확인함.
- 2026-07-20: Task 01-5 구현으로 `src/tools/generate_video.js`, `src/lib/evolink_video_generator.js`, `src/lib/save_video_result.js`를 추가하고 `src/server.js`에 `generate_video` tool 등록을 연결함.
