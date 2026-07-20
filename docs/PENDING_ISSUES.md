# Pending Issues

## 목적

이 문서는 아직 해소되지 않은 구조 의심과 보류 이슈를 기록하고 추적하기 위한 문서입니다.

## 보류된 의심
- `src/lib/evolink_video_generator.js`: EvoLink API 요청 생성, task 상태 조회, 결과 URL 다운로드 로직이 한 파일에 함께 있다. 이번 01-5 task에서는 단일 영상 tool 범위를 작게 유지하기 위해 기존 파일 유지안으로 진행했으며, EvoLink 기반 tool이 추가되면 task 클라이언트 분리를 재검토한다.
