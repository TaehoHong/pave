# PAVE

PAVE는 **Plan, Approve, Verify, Execute**의 약자입니다.

PAVE는 Codex-first 개발 하네스입니다. 에이전트가 작업을 계획하고, 중요한 제품 질문을 먼저 묻고, 수정 전 한 번 승인받고, 결과를 검증하며, 원할 때 프로젝트 방향성을 문서로 남기게 합니다.

기본 번들은 **PAVE + Superpowers**입니다. gstack은 full profile에서 선택적으로 확인합니다.

English documentation: [README.md](README.md)

## 빠른 시작

### Codex

```bash
codex plugin add superpowers@claude-plugins-official
codex plugin marketplace add TaehoHong/pave --ref main
codex plugin add pave@pave
```

대상 repo에서 새 Codex thread를 열고 실행합니다.

```text
/pave <요청 내용>
```

plugin 설치만으로는 프로젝트 파일을 만들지 않습니다. 선택 문서화: `/project-init`을 실행하면 프로젝트 방향성, 온보딩 맥락, 오래 유지할 제품 결정을 저장해 repo-local docs와 PAVE runtime 파일로 남깁니다.

### Claude Code

```bash
claude plugin marketplace add TaehoHong/pave
claude plugin install pave@pave
```

그 다음 실행합니다.

```text
/pave <요청 내용>
```

### 고급

```bash
# local source plugin 개발
git clone https://github.com/TaehoHong/pave.git
cd pave
./scripts/install_plugin.sh

# full companion profile로 repo runtime 수동 설치
./scripts/install.sh <repo-path> --companions full

# companion check 없이 repo runtime 수동/오프라인 설치
./scripts/install.sh <repo-path> --companions none

# 설정된 프로젝트 확인
./scripts/doctor.js <repo-path> --companions default

# companion 감지만 따로 문제 해결
./scripts/check_companions.sh --companions default
```

## Commands

| Command | 하는 일 |
| --- | --- |
| `/pave` | 기능, 버그, 리뷰, 리팩터링, 분석, 문서 작업을 처리하는 기본 워크플로우 |
| `/project-init` | 제품 방향성, 온보딩 문서, 규칙, 아키텍처를 포함한 선택적 repo-local 초기화 |
| `/doctor` | 설치, companion, runtime, docs 상태 점검 |
| `/status` | branch 상태, PAVE runtime, 최신 plan/report, 다음 액션을 수정 없이 요약 |
| `/plan` | 코드나 테스트를 고치지 않고 구현 계획만 작성 |
| `/verify` | source 변경 없이 fresh verification만 실행 |
| `/sync-docs` | overview, roadmap, 규칙, architecture 문서를 근거와 사용자 결정에 맞게 갱신 |
| `/token-save` | 저비용 구현 계약을 만들고 결과 diff만 리뷰 |

## 동작 방식

- 기본 원본은 plugin-local PAVE skill, references, commands, role briefs입니다.
- PAVE는 `AGENTS.md`, `CLAUDE.md`, `.codex/pave/config.md`가 이미 있을 때만 추가로 읽습니다.
- `.claude/agents/`는 Claude Code가 agent를 발견하기 위한 repo-local adapter copy입니다.
- `/project-init`은 `docs/00-overview.md`, `01-roadmap.md`, 개발/배포/디자인/품질 규칙, `06-architecture.md`를 선택적으로 만듭니다.
- 구현 작업은 계획, 승인, 실행, 검증, 최종 보고 순서로 진행합니다.

## 선택적 Repo Runtime

Plugin 설치만으로는 프로젝트에 파일이 추가되지 않습니다. `/project-init` 또는 `./scripts/install.sh <repo-path>`가 다음을 만들 수 있습니다.

```text
repo/
├── AGENTS.md
├── CLAUDE.md
├── .claude/
├── .codex/pave/
└── docs/
    ├── 00-overview.md
    ├── 01-roadmap.md
    ├── 02-development-rules.md
    ├── 03-deployment-rules.md
    ├── 04-design-rules.md
    ├── 05-quality-rules.md
    └── 06-architecture.md
```

이 문서들은 프로젝트 방향성, 온보딩 맥락, 아키텍처, 디자인 규칙, 개발 규칙, 오래 유지할 결정을 저장해서 이후 개발이 같은 방향을 유지하게 하는 용도입니다.

## Plugin 구조

PAVE는 Codex plugin이면서 Claude Code plugin입니다. Codex는 `.codex-plugin/plugin.json`와 `.agents/plugins/marketplace.json`를 사용하고, Claude Code는 `.claude-plugin/plugin.json`와 `.claude-plugin/marketplace.json`를 사용합니다. Companion dependency는 plugin manifest가 아니라 설치 문서, local helper, doctor check에서 처리합니다.
