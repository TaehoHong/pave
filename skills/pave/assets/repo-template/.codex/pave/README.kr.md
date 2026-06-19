# PAVE Runtime

이 프로젝트는 PAVE를 사용합니다. PAVE는 **Plan, Approve, Verify, Execute**의 약자입니다.

PAVE는 AI에게 기능 구현, 버그 수정, 분석, 리뷰를 맡길 때 계획, 승인, 구현, 검증, 보고가 한 흐름으로 진행되도록 돕습니다.

English documentation: [README.md](README.md)

## 가장 쉬운 사용법

Codex에서는 `$pave`로 요청합니다.

```text
$pave 이 기능 구현해줘
$pave 이 버그 원인 찾고 고쳐줘
$pave 현재 변경사항 리뷰해줘
$pave 이전 작업 이어서 진행해줘
```

Claude Code에서는 `/pave`로 요청합니다.

```text
/pave 이 기능 구현해줘
/pave 이 버그 원인 찾고 고쳐줘
/pave 현재 변경사항 리뷰해줘
/pave 이전 작업 이어서 진행해줘
```

## Companion 도구

- Superpowers는 PAVE default 프로필에서 필수입니다.
- gstack은 full 프로필에서만 필수이고, 기본 사용에서는 선택 사항입니다.
- 계획과 보고서는 Codex와 Claude Code 모두 `.codex/pave/`를 공유합니다.

## 작업 흐름

1. AI가 `AGENTS.md`, `CLAUDE.md`, `.codex/pave/config.md`를 읽습니다.
2. 현재 프로젝트 구조와 관련 코드를 확인합니다.
3. 기획, 정책, 디자인, 배포, 검증 기준에서 애매한 점을 먼저 질문합니다.
4. 필요한 경우 `.codex/pave/plans/`에 계획서를 만듭니다.
5. 코드나 테스트를 수정하기 직전에 한 번만 종합 승인 요청을 합니다.
6. 승인 후 구현, 테스트, 리뷰를 진행합니다.
7. 필요한 경우 역할별 subagent를 사용합니다.
8. 검증 명령을 실행하고 결과를 보고합니다.
9. 필요하면 `.codex/pave/reports/`에 final 또는 blocked 보고서를 남깁니다.

## Codex와 Claude Code 차이

| 항목 | Codex | Claude Code |
| --- | --- | --- |
| 호출 | `$pave ...` | `/pave ...` |
| 먼저 보는 파일 | `AGENTS.md` | `CLAUDE.md`, 그 다음 `AGENTS.md` |
| runtime 위치 | `.codex/pave/` | `.codex/pave/` |
| 역할별 보조 에이전트 | PAVE skill references | `.claude/agents/` |

## 이 폴더 안의 파일

- `config.md`: 이 프로젝트에서 PAVE가 따를 규칙입니다.
- `plans/`: 구현 전 계획서가 저장됩니다.
- `reports/`: 완료 또는 blocked 보고서가 저장됩니다.
- `templates/`: 계획서와 보고서 양식입니다.
- `adapters/`: Codex, Claude Code, generic agent별 사용 안내입니다.

## 설치 상태 확인

Codex에서 이렇게 요청하세요.

```text
$pave 이 repo의 PAVE 설치 상태 확인해줘
```

터미널 fallback은 PAVE 소스 repo에서 실행합니다.

```bash
./scripts/check_companions.sh
./scripts/doctor.js <repo-path>
```
