# PAVE

> Plan, Approve, Verify, Execute — Codex와 Claude Code를 위한 가벼운 개발
> 워크플로입니다.

PAVE는 코딩 에이전트가 중요한 결정을 먼저 확인하고, 승인된 최소 변경을
수행한 뒤, fresh verification으로 결과를 증명하게 합니다. 플러그인만
설치하면 프로젝트 파일을 만들지 않고 사용할 수 있습니다. 필요할 때만
프로젝트 초기화를 실행해 오래 유지할 제품 방향과 개발 규칙을 저장합니다.

PAVE는 독립적으로 동작하며 companion plugin, hosted service, MCP server,
credential이 필요하지 않습니다.

English documentation: [README.md](README.md)

효과·비용 검증 방법론: [BENCHMARKING.md](BENCHMARKING.md)

## 빠른 시작

### Codex

```bash
codex plugin marketplace add TaehoHong/pave --ref main
codex plugin add pave@pave
```

대상 저장소에서 새 Codex task를 열고 실행합니다.

```text
$pave:pave 로그인 timeout 버그를 수정하고 회귀 여부를 검증해.
```

### Claude Code

```bash
claude plugin marketplace add TaehoHong/pave
claude plugin install pave@pave
```

Claude Code를 재시작하고 대상 저장소에서 실행합니다.

```text
/pave:pave 로그인 timeout 버그를 수정하고 회귀 여부를 검증해.
```

요청이 설치된 skill의 범위와 일치하면 두 에이전트 모두 PAVE를 자동으로
선택할 수도 있습니다.

## 동작 방식

```text
요청
  ├─ 작고 명확한 저위험 변경
  │    └─ 조사 → 수정 → 검증
  └─ 일반 작업
       └─ 조사 → 계획 → 승인 → 실행 → 검증 → 보고
```

PAVE는 질문이나 수정 전에 저장소를 조사합니다. 사용자가 구현을 직접
요청했고 직접 수정 파일 2개 이하와 실질 변경 20줄 이하를 모두 만족하는
저위험 변경에만 fast path를 사용합니다. 일반 작업에서는 현재 범위를
막는 중요한 사용자 소유 결정만 질문하고, 저장소·공식 외부 근거로 확인할
기술적 사실과 사용자 정책을 구분하며, 남은 결정 수를 표시합니다. 미래
계약 변경을 막는 확장 지점은 현재 설계에 남기되, 사용하지 않는 provider,
workflow, 정책은 미리 구현하지 않습니다. 범위 의도는 읽기 전용 조사를
허용하지만 설계 선택이나 질문에 대한 답변은 쓰기 승인이 아닙니다. 버그는
근본 원인을 찾고, 의미 있는 동작을 보호할 때만 테스트를 추가하며, fresh
evidence 없이는 완료를 주장하지 않습니다.
사용자에게 보이는 화면을 바꾸는 작업에서는 durable 디자인 정책, design
token·component 파일, 가장 가까운 canonical component 순서로 프로젝트
디자인 시스템을 확정하고, 일회성 스타일을 추가하는 대신 기존 component와
token을 재사용하며, 모든 이탈은 사용자 결정 사항으로 올립니다.
선택적 runtime이 초기화된 저장소에서는 신선도를 확인한
`docs/07-codebase-guide.md`를 먼저 사용해 모듈 소유자, 공통 코드, 관례,
canonical example, 좁은 검증 위치를 찾고 관련 없는 코드는 다시 읽지
않습니다.

## Skills

| 목적 | Codex | Claude Code |
| --- | --- | --- |
| 기본 워크플로 | `$pave:pave` | `/pave:pave` |
| 선택적 프로젝트 runtime 초기화 | `$pave:project-init` | `/pave:project-init` |
| 설치와 프로젝트 상태 점검 | `$pave:doctor` | `/pave:doctor` |
| 프로젝트와 워크플로 상태 확인 | `$pave:status` | `/pave:status` |
| source 수정 없는 계획 작성 | `$pave:plan` | `/pave:plan` |
| source 수정 없는 검증 실행 | `$pave:verify` | `/pave:verify` |
| 장기 프로젝트 문서 동기화 | `$pave:sync-docs` | `/pave:sync-docs` |
| 일회성 저비용 워크플로 | `$pave:token-save` | `/pave:token-save` |
| 단계별 시간과 토큰 통계 확인 | `$pave:usage` | 아직 지원하지 않음 |

## 로컬 사용량 통계

Codex에서 PAVE는 `inspect`, `plan`, `approval`, `execute`, `verify`,
`report` 단계의 소요시간과 토큰 차이를 기록할 수 있습니다. 플러그인을
설치하거나 업데이트한 뒤 `/hooks`에서 PAVE의 로컬 lifecycle hook을 검토하고
신뢰 처리한 다음 아래 명령을 사용합니다.

```text
$pave:usage latest
$pave:usage daily
$pave:usage weekly
$pave:usage cumulative
```

Codex 내장 `/usage`는 기존처럼 계정 단위 사용량을 표시합니다. PAVE는
플러그인의 쓰기 가능한 data 디렉터리에 집계된 시각, 토큰 수, 모델,
저장소 이름만 보관하며 prompt, 응답, source 파일, transcript 내용은 복사하지
않습니다. 현재 Codex transcript에서 호환되는 `token_count` 이벤트를 얻을 수
없으면 토큰 값은 추정하지 않고 `unavailable`로 표시합니다. Claude Code의
사용량 수집은 이번 범위에 포함하지 않았습니다.

## 장기 프로젝트 지식

PAVE는 검증이 끝난 뒤 해당 작업이 재사용할 프로젝트 지식을 만들었는지
판단합니다. 사용자 확정, 저장소 증거, 권위 있는 외부 근거로 확인된 사실만
주제를 소유한 기존 문서에 승격합니다. 기계적인 수정, 원시 작업 이력,
입증되지 않은 가설은 canonical 문서에 넣지 않습니다.

원인이 직관적이지 않거나 재발 가능한 장애라면 초기화된 프로젝트에서
`docs/troubleshooting/`을 지연 생성할 수 있습니다. 각 기록에는 증상, 진단
근거, 입증된 원인 또는 명시적 불확실성, 해결책, 회귀 방지 장치와 검증 결과를
남깁니다. 현재 운영·아키텍처·품질·소유권 규칙은 계속 해당 canonical
프로젝트 문서에 증류합니다. 프로젝트 초기화나 plugin-only 모드에서는 이
디렉터리를 미리 만들지 않습니다.

Git은 상세 변경 이력을 담당하고, PAVE 문서는 앞으로 알아야 할 내용과 그
이유를 담당합니다.

## Plugin-only와 Project Runtime

| 모드 | 저장소 변경 | 적합한 용도 |
| --- | --- | --- |
| Plugin only | 없음 | 일반적인 기능, 버그, 리뷰, 리팩터링, 분석, 문서 작업 |
| `$pave:project-init` / `/pave:project-init` | 승인된 PAVE runtime과 프로젝트 문서 추가 | 제품 방향, 규칙, 온보딩 맥락을 오래 유지할 팀 |

기본값은 plugin-only입니다. 프로젝트 초기화는 선택 사항이며, 장기 저장소
파일을 쓰기 전에 승인을 요청합니다.

이미 진행 중인 저장소에서는 초기화가 먼저 기존 문서를 조사합니다. 다른 문서
루트, `README`, `ARCHITECTURE`, ADR, 스타일 가이드, design token, 컴포넌트
라이브러리를 찾아 각 주제를 소유한 기존 문서를 PAVE 문서의 `Linked Sources`
표에 연결합니다. 연결된 문서가 계속 source of truth이므로, 이미 적혀 있는
내용을 다시 만들지 않고 인터뷰 범위만 좁힙니다.

선택적 runtime은 다음 파일을 만들 수 있습니다.

```text
repo/
├── AGENTS.md
├── CLAUDE.md
├── .claude/
├── .codex/pave/
│   ├── adapters/
│   ├── plans/
│   ├── reports/
│   └── config.md
└── docs/
    ├── 00-overview.md
    ├── 01-roadmap.md
    ├── 02-development-rules.md
    ├── 03-deployment-rules.md
    ├── 04-design-rules.md
    ├── 05-quality-rules.md
    ├── 06-architecture.md
    ├── 07-codebase-guide.md
    └── troubleshooting/       # 가치 있는 장애가 생길 때 지연 생성
```

Codex와 Claude Code는 PAVE 공통 계약을 공유하지만 별도 runtime adapter를
사용합니다. 모델 선택, reasoning effort, 권한, agent discovery는 각
실행 환경의 native 설정에 남습니다.

## 업데이트

### Codex

```bash
codex plugin marketplace upgrade pave
codex plugin add pave@pave
```

재설치 후 새 task를 시작합니다.

### Claude Code

```bash
claude plugin marketplace update pave
claude plugin update pave@pave
```

업데이트 후 Claude Code를 재시작합니다.

플러그인 업데이트는 plugin-local 워크플로만 갱신합니다. 기존 repo-local
runtime 파일은 프로젝트 초기화나 명시적 동기화를 다시 실행하기 전까지
변경되지 않습니다.

## 설치 확인과 제거

```bash
# Codex
codex plugin list --marketplace pave
codex plugin remove pave@pave

# Claude Code
claude plugin list
claude plugin uninstall pave@pave
```

초기화된 프로젝트에서는 Codex의 `$pave:doctor` 또는 Claude Code의
`/pave:doctor`로 repo-local runtime 상태를 확인합니다.

## Project Runtime 수동 설치

선택적 저장소 스크립트에만 Node.js 18 이상이 필요합니다.

```bash
git clone https://github.com/TaehoHong/pave.git
cd pave

# 파일을 쓰지 않고 미리 확인
./scripts/install.sh <repo-path> --dry-run

# 기존 파일을 덮어쓰지 않고 runtime과 starter docs 설치
./scripts/install.sh <repo-path>

# 초기화된 프로젝트 점검
node ./scripts/doctor.js <repo-path>
```

`--force`는 대상 파일을 검토한 뒤에만 사용합니다. 일치하는 runtime과
문서 template을 덮어씁니다.

## 제한사항

- 사용자가 명시적으로 요청하고 승인하지 않으면 PAVE는 자동으로 commit,
  push, deploy하거나 외부 서비스에 접근하지 않습니다.
- 플러그인 업데이트는 프로젝트가 소유한 `AGENTS.md`, `CLAUDE.md`,
  `.codex/pave/`, `docs/`를 덮어쓰지 않습니다.
- 공식 plugin surface는 Codex와 Claude Code입니다. 다른 에이전트도
  Markdown skill을 읽을 수 있지만 설치와 동작을 지원 대상으로 문서화하지
  않습니다.

## 로컬 개발

```bash
git clone https://github.com/TaehoHong/pave.git
cd pave
./scripts/install_plugin.sh
npm test
npm run check
claude plugin validate --strict .claude-plugin/plugin.json
```

저장소에는 하나의 PAVE skill·role brief 원본과 Codex·Claude Code 전용
manifest 및 adapter가 들어 있습니다.

## License

[MIT](LICENSE) © TaehoHong
