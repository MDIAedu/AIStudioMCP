# Task 01-3 - 이미지 프롬프트 기반 이미지 생성 tool

## 설명
01-2 단계에서 얻은 이미지 프롬프트를 입력으로 사용해 이미지를 생성할 수 있어야 한다. 이번 단계는 이미지 프롬프트 1개를 받아 OpenAI API 공식 문서를 기준으로 이미지를 생성하는 단일 MCP tool 범위만 다룬다.

## 구현 항목
- [x] 이미지 프롬프트를 입력받는 이미지 생성용 MCP tool이 추가된다.
- [x] tool 호출 결과에 생성된 이미지 결과가 포함된다.
- [x] OpenAI API를 사용해 이미지를 생성한다.
- [x] 01-2 단계에서 생성된 스크립트의 이미지 프롬프트를 현재 단계 입력값으로 사용할 수 있다.
- [x] generate_image tool 실행 결과가 MCP workspace root의 `output/image/` 폴더에 이미지 파일로 저장된다.

## 범위 밖
- 스크립트 생성 직후 이미지 생성을 자동 연쇄 실행하는 기능
- 여러 장면의 이미지 프롬프트를 한 번에 일괄 생성하는 기능
- 영상 생성 tool 구현
- 이미지 편집, 업스케일, 스타일 변형 같은 후처리 기능

## 사전 전제
- `Tasks/01-2_generate_script_tool.md`의 장면별 스크립트 생성 결과에서 이미지 프롬프트를 얻을 수 있어야 한다.

## 수동 작업 (구현 후 구체화)
- 프로젝트 루트의 `.env` 파일에 `OPENAI_API_KEY=실제_API_키값` 형식으로 OpenAI API 키를 입력한다.
- MCP 클라이언트 또는 inspector에서 이 저장소의 `npm start` 실행 구성을 사용하도록 서버를 연결한다.

## 완료 조건

### 에이전트 확인
- [x] 관련 코드 수정 완료
- [x] 로컬 정적 점검 또는 프로젝트 구조 기준 확인 완료
- [x] JavaScript/MCP tool 규칙 위반 없음
- [x] 현재 task 문서가 실제 구현 기준으로 갱신됨

### 결과 확인 (구현 후 구체화)
- [x] 프로젝트 루트에서 `npm start`로 MCP 서버를 실행한다.
- [x] MCP inspector 또는 MCP 클라이언트에서 tool 목록에 `generate_image`가 노출되는지 확인한다.
- [x] `generate_script` tool을 호출해 얻은 `scenes` 배열 항목의 `image_prompt` 값을 복사한다.
- [x] `generate_image` tool을 `image_prompt` 값과 함께 호출했을 때 응답에 `image_prompt`, `image_base64`, `output_format`, `model`, `saved_file_path`가 포함되는지 확인한다.
- [x] `generate_image` tool을 호출했을 때 MCP inspector 또는 MCP 클라이언트에서 base64 문자열 대신 실제 이미지가 렌더링되어 보이는지 확인한다.
- [x] `generate_image` tool 응답의 `image_base64`를 base64로 디코딩했을 때 실제 PNG 이미지로 열리는지 확인한다.
- [ ] `generate_image` tool을 호출했을 때 응답의 `saved_file_path` 경로가 MCP workspace root의 `output/image/` 하위 이미지 파일이고, 열 수 있는지 확인한다.
- [x] `OPENAI_API_KEY`를 설정하지 않은 상태에서 `generate_image` tool을 호출했을 때 원인이 드러나는 에러 메시지가 반환되는지 확인한다.
