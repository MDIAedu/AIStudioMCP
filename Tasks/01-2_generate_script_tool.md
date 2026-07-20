# Task 01-2 - 영상 주제 기반 장면 스크립트 생성 tool

## 설명
사용자가 영상 주제를 입력하면 장면별로 나뉜 스크립트를 생성할 수 있어야 한다. 각 장면에는 장면 설명, 이미지 프롬프트, 영상 프롬프트, 나레이션이 함께 포함되어야 하며, 스크립트 생성은 OpenAI API 공식 문서를 기준으로 연동하는 단일 MCP tool 범위에서 다룬다.

## 구현 항목
- [x] 영상 주제를 입력받는 스크립트 생성용 MCP tool이 추가된다.
- [x] tool 호출 결과에 장면별 스크립트 구조가 포함된다.
- [x] 각 장면에 장면 설명, 이미지 프롬프트, 영상 프롬프트, 나레이션이 모두 포함된다.
- [x] OpenAI API를 사용해 스크립트를 생성한다.
- [x] generate_script tool 실행 결과가 MCP workspace root의 `output/script/` 폴더에 JSON 파일로 저장된다.

## 범위 밖
- 이미지 생성 tool 구현
- 영상 생성 tool 구현
- 여러 OpenAI 모델 비교 또는 모델 선택 UI 추가
- 생성된 스크립트를 바탕으로 다음 단계를 자동 연쇄 실행하는 기능

## 사전 전제
- `Tasks/01-1_mcp_server_skeleton.md`의 MCP 서버 실행 및 기본 tool 노출 상태가 준비되어 있어야 한다.

## 수동 작업 (구현 후 구체화)
- 프로젝트 루트에 `.env` 파일을 만들고 `OPENAI_API_KEY=실제_API_키값` 형식으로 입력한다.
- MCP 클라이언트 또는 inspector에서 이 저장소의 `npm start` 실행 구성을 사용하도록 서버를 연결한다.

## 완료 조건

### 에이전트 확인
- [x] 관련 코드 수정 완료
- [x] 로컬 정적 점검 또는 프로젝트 구조 기준 확인 완료
- [x] JavaScript/MCP tool 규칙 위반 없음
- [x] 현재 task 문서가 실제 구현 기준으로 갱신됨

### 결과 확인 (구현 후 구체화)
- [x] 프로젝트 루트에서 `npm start`로 MCP 서버를 실행한다.
- [x] MCP inspector 또는 MCP 클라이언트에서 tool 목록에 `generate_script`가 노출되는지 확인한다.
- [x] `generate_script` tool을 `topic` 값과 함께 호출했을 때 응답의 `scenes` 배열 각 항목에 `scene_description`, `image_prompt`, `video_prompt`, `narration`이 모두 포함되는지 확인한다.
- [ ] `generate_script` tool을 호출했을 때 응답의 `saved_file_path` 경로가 MCP workspace root의 `output/script/` 하위 JSON 파일이고, 내용이 tool 응답과 같은지 확인한다.
- [x] `OPENAI_API_KEY`를 설정하지 않은 상태에서 `generate_script` tool을 호출했을 때 원인이 드러나는 에러 메시지가 반환되는지 확인한다.
