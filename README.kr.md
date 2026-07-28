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

PAVE는 질문이나 수정 전에 저장소를 조사합니다. 작고 명확한 변경에는
fast path를 사용하고, 버그는 근본 원인을 찾으며, 의미 있는 동작을 보호할
때만 테스트를 추가합니다. fresh evidence 없이는 완료를 주장하지 않습니다.

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

## Plugin-only와 Project Runtime

| 모드 | 저장소 변경 | 적합한 용도 |
| --- | --- | --- |
| Plugin only | 없음 | 일반적인 기능, 버그, 리뷰, 리팩터링, 분석, 문서 작업 |
| `$pave:project-init` / `/pave:project-init` | 승인된 PAVE runtime과 프로젝트 문서 추가 | 제품 방향, 규칙, 온보딩 맥락을 오래 유지할 팀 |

기본값은 plugin-only입니다. 프로젝트 초기화는 선택 사항이며, 장기 저장소
파일을 쓰기 전에 승인을 요청합니다.

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
    └── 06-architecture.md
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
