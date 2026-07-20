# Architecture

## 목적
이 문서는 AI 에이전트가 파일을 만들거나 이동할 때 폴더 책임, 파일 배치, tool/resource 등록 규칙을 확인하는 기준 문서입니다.

## 구조 원칙

- 서버 진입점(transport 연결, tool 등록), 개별 tool 정의, 외부 AI API 연동 등 공용 로직의 책임을 분리합니다.
- 지금 필요한 범위에서만 구조를 확장합니다.

## 공통 폴더 책임

- `docs/`: 하네스 문서와 작업 규칙
- `Tasks/`: 개별 task 문서
- `src/`: JavaScript 소스 코드
- `src/tools/`: 개별 MCP tool 정의와 핸들러
- `src/lib/`: 여러 tool이 공유하는 외부 AI API 연동, 공통 유틸 등의 로직

## 현재 프로젝트 폴더 책임과 구조

<!-- 새 프로젝트 시작 시 이 구역의 항목을 초기화한다. -->
- `package.json`: Node.js 실행 스크립트와 MCP SDK 의존성 정의
- `src/server.js`: MCP 서버 생성, stdio transport 연결, 등록된 MCP tool 연결
- `src/tools/ping.js`: 서버 연결 확인용 `ping` tool 정의
- `src/tools/generate_script.js`: 영상 주제를 받아 OpenAI 기반 장면 스크립트를 생성하는 `generate_script` tool 정의
- `src/tools/generate_image.js`: 이미지 프롬프트를 받아 OpenAI 기반 이미지를 생성하는 `generate_image` tool 정의
- `src/tools/generate_voice.js`: 장면별 대사를 받아 ElevenLabs 기반 음성을 생성하는 `generate_voice` tool 정의
- `src/lib/load_env.js`: 프로젝트 루트 `.env` 파일을 읽어 런타임 환경 변수로 반영
- `src/lib/openai_script_generator.js`: OpenAI Responses API 호출과 스크립트 응답 파싱 처리
- `src/lib/openai_image_generator.js`: OpenAI Image API 호출과 이미지 응답 파싱 처리
- `src/lib/elevenlabs_voice_generator.js`: ElevenLabs Text to Speech API 호출과 음성 응답 파싱 처리
- `src/lib/save_script_result.js`: 생성된 스크립트 결과를 워크스페이스 루트 JSON 파일로 저장
- `src/lib/save_image_result.js`: 생성된 이미지를 워크스페이스 루트 PNG 파일로 저장
- `src/lib/save_voice_result.js`: 생성된 음성을 워크스페이스 루트 오디오 파일로 저장

## Tool 이름 원칙

- tool 이름은 동사형으로 역할이 드러나게 작성합니다. (예: `generate_script`, `generate_image`)
- tool 파일 이름은 tool 이름과 대응되게 작성합니다.
- 입력 스키마, 응답 타입의 이름도 역할이 드러나게 작성합니다.

## JavaScript 파일 이름 원칙

- 새 JavaScript 파일 이름은 역할이 드러나게 작성합니다. 확장자는 `.js`를 사용합니다.
- 현재 프로젝트에 기존 네이밍 규칙이 있으면 그 규칙을 우선합니다.

## 권장 파일 배치

- 파일은 먼저 `## 현재 프로젝트 폴더 책임과 구조`에 기록된 폴더 책임을 기준으로 배치합니다.
- 같은 성격의 파일은 기존에 정의된 책임 폴더를 우선 재사용합니다.

## 변경 원칙

- 파일이 기존에 정의된 책임 폴더로 배치할 수 없으면 새 폴더를 생성한 뒤 배치합니다.
- 새 폴더, 새 패키지, 새 모듈, 대규모 리팩터링은 사용자에게 이유와 범위를 먼저 알리고 승인을 받은 뒤 진행합니다.
- 작업 중인 task 범위를 넘어서는 구조 정리는 별도 요청 없이는 하지 않습니다.
- 새 폴더를 생성하면 `## 현재 프로젝트 폴더 책임과 구조`에 해당 폴더와 역할을 추가합니다.
- 기존 폴더에 현재 구조를 설명하는 데 중요한 파일이 추가되거나 대표 파일 구성이 바뀌면, `## 현재 프로젝트 폴더 책임과 구조`에 해당 폴더의 대표 파일 예시와 각 파일의 한 줄 역할을 실제 구조에 맞게 갱신한다.
