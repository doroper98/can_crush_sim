# Can Crush Simulator — Autoresearch Development

> *"You are not touching any of the Python files like you normally would as a researcher.*
> *Instead, you are programming the program.md Markdown files."*
> — Andrej Karpathy, March 2026

---

## 이 레포는 무엇인가

알루미늄 캔의 구조적 압축 변형을 실시간 3D로 시뮬레이션하는 웹앱이다.
Karpathy의 **autoresearch** 패턴을 ML 훈련이 아닌 **웹앱 개발**에 적용한다.

### autoresearch 핵심 개념 매핑

| Karpathy autoresearch | Can Crush Simulator |
|----------------------|---------------------|
| `prepare.py` (고정) | `GOAL.md` (고정) — 목표 명세, 기술 스택, 디자인 시스템 |
| `train.py` (에이전트 수정) | `src/` 전체 (에이전트 수정) — 모든 소스코드 |
| `program.md` (인간 수정) | `program.md` (인간 수정) — 에이전트 행동 지시 |
| val_bpb (단일 메트릭) | 복합 메트릭 (build_ok, render_fps, physics_ok, ui_score) |
| 5분 훈련 = 1 실험 | 1 코드 변경 + 빌드 + 테스트 = 1 실험 |
| git commit/reset | 동일 — 성공만 커밋, 실패는 reset |
| results.tsv | 동일 — 실험 로그 (git 미추적) |

---

## 파일 구조

```
├── GOAL.md          ← 목표 명세 (수정 금지)
├── program.md       ← 에이전트 지시문 (인간 편집)
├── README.md        ← 이 파일
├── src/             ← 에이전트가 수정하는 영역
├── tests/           ← 자동 테스트
├── results.tsv      ← 실험 로그 (git 미추적)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 작동 방식

```
인간 → program.md 작성 (방향, 기준, 우선순위)
       ↓
에이전트 → src/ 코드 수정 → 빌드 → 테스트 → 측정
       ↓                                    ↓
   개선됨 → git commit              악화됨 → git reset
       ↓                                    ↓
   results.tsv 기록 ←←←←←←←←←←←← results.tsv 기록
       ↓
   다음 실험 (무한 반복)
```

에이전트는 인간이 자는 동안에도 실험을 계속한다.
아침에 일어나서 `results.tsv`와 `git log`를 읽으면 된다.

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- Claude Code (또는 다른 AI 코딩 에이전트)

### 실행

```bash
# 1. 에이전트에게 전달
"GOAL.md와 program.md를 읽고 실험 루프를 시작해."

# 2. 인간은 떠난다 (선택)

# 3. 결과 확인
cat results.tsv
git log --oneline
```

---

## 인간의 역할

1. **program.md를 개선한다** — 에이전트의 방향성, 우선순위, 판단 기준을 조정
2. **GOAL.md를 관리한다** — 새 요구사항 추가, 스펙 변경 시 CHANGELOG에 기록
3. **results.tsv를 리뷰한다** — 실험 패턴 분석, 병목 발견
4. **에이전트를 재시작한다** — 방향 수정 후 다시 놓아준다

코드를 직접 짜지 않는다.
코드를 짜는 에이전트에게 **어떻게 생각할지를 가르치는 글**을 쓴다.

---

## Karpathy가 보여준 것

> *"The goal is to engineer your agents to make the fastest research progress*
> *indefinitely and without any of your own involvement."*

이 레포는 그 원칙을 웹앱 개발에 적용한 실험이다.
프로그래밍의 레이어가 올라갔다:

```
[과거] 인간 → 코드 → 컴퓨터
[현재] 인간 → 지시문(md) → 에이전트 → 코드 → 컴퓨터
[다음] 인간 → 목표 → 에이전트 → 지시문 → 에이전트 → 코드 → 컴퓨터
```

우리는 지금 두 번째 단계에 있다.

---

## 라이선스

MIT
