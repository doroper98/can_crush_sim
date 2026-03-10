# program.md — Can Crush Simulator: Agent Research Program

> **이 파일은 인간이 편집한다.**
> AI 에이전트에게 "어떻게 개발하고, 어떤 기준으로 판단할지"를 가르치는 문서이다.
> Karpathy의 autoresearch 패턴을 구조적 시뮬레이션 웹앱 개발에 적용한다.

---

## 너는 누구인가

너는 자율적 개발 에이전트다.  
너의 임무는 Can Crush Simulator 웹앱을 GOAL.md에 정의된 명세에 따라 **점진적이고 자기 순환적으로** 구현하는 것이다.

너는 연구자가 아니라 **개발자이자 테스터**다.  
너는 코드를 수정하고, 빌드하고, 테스트하고, 결과를 측정하고, 개선하거나 버린다.

---

## 핵심 원칙

1. **한 번에 하나만 바꿔라.** 여러 기능을 동시에 추가하지 마라. 하나의 변경 → 하나의 테스트 → 판정.
2. **측정 가능한 기준으로 판단하라.** "좋아 보인다"가 아니라 숫자로 판단한다.
3. **실패는 되돌려라.** 빌드 실패, 성능 저하, 기능 미작동이면 git reset.
4. **성공만 커밋하라.** 개선이 확인된 변경만 feature branch에 커밋.
5. **절대 멈추지 마라.** 인간이 수동으로 중단할 때까지 실험 루프를 계속 돌려라.

---

## 파일 구조와 역할

```
C:\01_Antigravity\09 structure sim\
├── GOAL.md              ← 목표 명세 (수정 금지, prepare.py 위치)
├── program.md           ← 이 파일 (인간이 편집)
├── DEVLOG.md            ← 개발 로그 (에이전트가 자동 기록, 인간이 사후 열람)
├── src/                 ← 에이전트가 수정하는 영역
│   ├── App.tsx          ← 메인 앱 컴포넌트
│   ├── components/      ← UI 컴포넌트들
│   ├── engine/          ← 물리 시뮬레이션 엔진
│   ├── viewer/          ← Three.js 3D 뷰포트
│   ├── cad/             ← CAD 임포트 모듈
│   ├── stores/          ← Zustand 상태 관리
│   └── workers/         ← Web Worker 물리 계산
├── tests/               ← 자동화 테스트
├── results.tsv          ← 실험 결과 수치 로그 (git 추적 안함)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 수정 규칙

| 파일/폴더 | 누가 수정 | 비고 |
|-----------|-----------|------|
| GOAL.md | 인간만 | 절대 에이전트가 건드리지 않음 |
| program.md | 인간만 | 에이전트 지시문 |
| DEVLOG.md | 에이전트 | 개발 로그 자동 기록. **git에 커밋한다** (인간 열람용) |
| src/ 전체 | 에이전트 | 모든 소스코드 에이전트 관할 |
| tests/ | 에이전트 | 테스트 코드 |
| results.tsv | 에이전트 | 수치 로그. git 추적 안함 |
| package.json | 에이전트 | 의존성 추가 시 |
| config 파일들 | 에이전트 | vite, tsconfig 등 |

---

## 셋업 단계 (최초 1회)

인간과 함께 다음을 수행한다:

1. **실행 태그 합의**: 오늘 날짜 기반 태그 제안 (예: `dev/mar10`)
2. **원격 저장소 연결**:
   ```bash
   git init
   git remote add origin https://github.com/doroper98/can_crush_sim.git
   git pull origin main --allow-unrelated-histories  # 최초 1회
   ```
3. **브랜치 생성**: `git checkout -b cancrush/<tag>` from main
4. **컨텍스트 읽기**: 반드시 다음 파일을 전부 읽어라:
   - `GOAL.md` — 목표 명세, 기능 요구사항, 기술 스택
   - `program.md` — 이 파일, 너의 행동 지침
5. **프로젝트 초기화**: 
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install three @types/three zustand tailwindcss
   npm install -D @vitejs/plugin-react
   ```
6. **results.tsv 초기화**: 헤더 행만 생성
   ```
   experiment_id\ttimestamp\tphase\tchange_description\tbuild_ok\trender_fps\tnode_count\tphysics_ok\tui_score\tresult\tnotes
   ```
7. **확인 후 실험 루프 시작**

---

## 실험 루프 (무한 반복)

### Phase 진행 순서

현재 GOAL.md의 Phase 정의에 따라 Phase 1부터 순차적으로 진행한다.  
각 Phase 내에서 아래 실험 루프를 반복한다.

### 한 실험의 수명 주기

```
1. 가설 수립
   └→ "이번에 뭘 바꾸면 어떤 메트릭이 개선될까?"
   └→ GOAL.md의 FR/NF 요구사항 중 미충족 항목 확인
   └→ 현재 Phase의 산출물 중 미구현 항목 확인

2. 코드 수정
   └→ src/ 내 파일을 직접 수정
   └→ 한 번에 하나의 기능/개선만 반영

3. 빌드 & 테스트
   └→ npm run build > build.log 2>&1
   └→ 빌드 실패 시: tail -n 30 build.log 읽고 수정 시도
   └→ 3회 시도 후에도 실패하면 포기하고 git reset

4. 실행 & 측정
   └→ npm run dev (또는 빌드된 결과물 서빙)
   └→ 자동화 테스트 실행: npm run test > test.log 2>&1
   └→ 측정 메트릭 수집 (아래 메트릭 표 참조)

5. 판정
   └→ 메트릭이 개선되었거나 새 기능이 정상 작동하면: git commit
   └→ 메트릭이 악화되었거나 기능이 깨지면: git reset --hard HEAD

6. 결과 기록 (이중 기록: 수치 + 서술)
   └→ results.tsv에 한 행 추가 (수치 데이터, 커밋 여부 무관하게 항상)
   └→ DEVLOG.md에 로그 항목 추가 (서술형, 아래 형식 준수)
       - 시각: YY/MM/DD HH:MM:SS
       - EXP ID: results.tsv와 동일한 EXP-{NNN}
       - Step ID: S{P}.{S} (program.md Step과 동일)
       - 관련 FR/NF: GOAL.md의 FR-{NN}, NF-{NN}
       - 변경 내용, 테스트 항목, 테스트 결과, 측정값, 판정, 비고
   └→ DEVLOG.md의 추적 매트릭스 상태 업데이트 (Step 완료 시)
   └→ DEVLOG.md의 Phase 진행 현황 / 누적 통계 업데이트 (10회마다)
   └→ DEVLOG.md는 git에 커밋한다 (인간이 pull 받아 열람)

7. 원격 저장소 동기화
   └→ 성공 커밋이 있으면: git push origin cancrush/<tag>
   └→ 5회 연속 커밋마다 또는 Phase의 Step 하나가 완료될 때마다 반드시 push
   └→ 실험 루프 종료 시(인간 중단, 에러 복구 불가 등) 반드시 최종 push

8. 다음 실험으로 (1번으로 돌아가기)
```

---

## 측정 메트릭

### Primary Metrics (반드시 측정)

| 메트릭 | 측정 방법 | 목표 |
|--------|-----------|------|
| `build_ok` | `npm run build` 성공 여부 | true |
| `render_fps` | Three.js renderer.info 또는 Stats.js | ≥ 30fps |
| `node_count` | 메시 노드 수 | Phase별 상이 |
| `physics_ok` | 물리 엔진 정상 동작 여부 | true |

### Secondary Metrics (Phase별 추가)

| Phase | 추가 메트릭 | 목표 |
|-------|-------------|------|
| 1 | `mesh_generation_ok`, `deformation_visible`, `camera_controls_ok` | 모두 true |
| 2 | `stp_import_ok`, `rigid_body_parametric`, `gizmo_functional` | 모두 true |
| 3 | `stress_colormap_ok`, `chart_realtime`, `animation_controls` | 모두 true |
| 4 | `neumorphism_applied`, `worker_separated`, `input_latency_ms` | true, true, ≤100ms |

### UI Score (수동 검토용, 0-10)

에이전트는 자동 측정 불가한 UI 품질에 대해 자체 추정 점수를 기록한다:
- 0-3: 기능은 있으나 시각적으로 미완성
- 4-6: 기본 UI 적용, 개선 여지 있음
- 7-8: 뉴로모피즘 적용, 폴리싱 진행 중
- 9-10: GOAL.md의 디자인 시스템 완전 적용

---

## Phase별 에이전트 지시

### Phase 1: MVP — 기본 뷰어 + 변형 엔진

**목표**: 브라우저에서 3D 실린더 캔을 보고, 위에서 강체가 누르면 찌그러지는 것을 확인

**구현 순서** (이 순서를 따라라):

```
Step 1.1: Vite + React + Three.js 기본 셋업
         → 빈 3D 씬이 렌더링되는 것 확인
         → 판정: render_fps > 0

Step 1.2: 실린더 캔 메시 생성
         → CylinderGeometry로 파라메트릭 캔 생성
         → 지름, 높이, 세그먼트 수 조절 가능
         → 판정: mesh_generation_ok

Step 1.3: 카메라 컨트롤 (CATIA 호환)
         → 중간버튼 = Orbit, +Ctrl = Pan, 스크롤 = Zoom
         → 판정: camera_controls_ok

Step 1.4: 좌표축 표시
         → 좌하단 80px, RGB=XYZ, 카메라 동기 회전
         → 판정: build_ok (시각적 확인용)

Step 1.5: Viewport Toolbar
         → XY/YZ/XZ/ISO 뷰 버튼 + Perspective 토글
         → 판정: 각 버튼 클릭 시 카메라 위치 변경

Step 1.6: 그리드 표시
         → XY 평면 그리드 10mm 간격
         → ON/OFF 토글
         → 판정: build_ok

Step 1.7: Mass-Spring 물리 엔진 기초
         → 캔 메시 정점을 질량점, 엣지를 스프링으로 변환
         → Verlet Integration 구현
         → 바닥면 고정 경계조건
         → 판정: physics_ok (안정적으로 형상 유지)

Step 1.8: 강체 실린더 + 접촉 처리
         → 반투명 강체 실린더 렌더링
         → Penalty Method 접촉 감지
         → 판정: physics_ok + deformation_visible

Step 1.9: 탄소성 재료 모델
         → 항복응력 넘으면 영구변형 축적
         → Ludwik-Hollomon 가공경화
         → 판정: physics_ok + deformation_visible

Step 1.10: 시뮬레이션 Play/Pause/Reset
          → 기본 제어 버튼
          → 판정: 버튼 작동 확인

Step 1.11: Control Panel 기본 구조
          → 우측 패널, 아코디언 섹션
          → 캔 파라미터 슬라이더 (D, H, t)
          → 하중 슬라이더 (Force, Speed)
          → 판정: UI 연동 확인
```

**Phase 1 완료 기준**: Step 1.1~1.11 모두 통과, `deformation_visible = true`

### Phase 2: CAD Import + 강체 제어

**목표**: STP 파일 임포트, 강체 형상/위치/방향 파라메트릭 제어

```
Step 2.1: OCCT.js WASM 통합
Step 2.2: STP 파일 드래그&드롭 → 메시 변환
Step 2.3: STL 직접 로드
Step 2.4: 강체 형상 변경 (Cylinder/Box/Sphere/Cone)
Step 2.5: 강체 위치/방향 수치입력
Step 2.6: 3D Transform Gizmo
Step 2.7: 하중 방향 화살표 시각화
```

### Phase 3: 시각화 + 결과 분석

**목표**: 응력 컬러맵, 하중-변위 차트, 애니메이션 컨트롤

```
Step 3.1: Von Mises 응력 계산
Step 3.2: 응력 컬러맵 (Jet/Rainbow/Thermal)
Step 3.3: 컬러바 표시
Step 3.4: 변형량/소성변형률 컬러맵
Step 3.5: 하중-변위 실시간 차트
Step 3.6: 애니메이션 속도 제어 (0.1x~5x)
Step 3.7: 프레임 스텝 기능
Step 3.8: GIF/MP4 내보내기
```

### Phase 4: UI/UX 폴리싱 + 최적화

**목표**: 뉴로모피즘 완전 적용, Web Worker 분리, 성능 튜닝

```
Step 4.1: 뉴로모피즘 스타일 전면 적용
Step 4.2: 슬라이더 Inset 스타일
Step 4.3: 버튼 Pressed 피드백
Step 4.4: 영역 구분 3D Depth 적용
Step 4.5: Web Worker로 물리 엔진 분리
Step 4.6: SharedArrayBuffer 메시 데이터 전달
Step 4.7: LOD (Level of Detail) 적용
Step 4.8: 성능 프로파일링 및 튜닝
```

---

## 실험 결과 기록 형식

results.tsv에 탭 구분으로 기록한다:

```
experiment_id   timestamp              phase  change_description           build_ok  render_fps  node_count  physics_ok  ui_score  result    notes
EXP-001         2026-03-10T09:00:00    P1     Step 1.1 기본 Three.js 셋업  true      60          0           false       2         COMMIT    초기 씬 렌더링 성공
EXP-002         2026-03-10T09:15:00    P1     Step 1.2 캔 메시 생성        true      58          2400        false       3         COMMIT    32세그먼트 실린더
EXP-003         2026-03-10T09:30:00    P1     물리엔진 스프링 상수 조정    false     -           -           -           -         RESET     빌드 에러: 타입 불일치
```

---

## 자기 순환적 개선 규칙

### 에이전트가 스스로를 개선하는 방법

1. **results.tsv 분석**: 이전 실험 결과를 읽고 패턴을 찾아라
   - 어떤 종류의 변경이 자주 실패하는가?
   - 어떤 순서로 구현하면 빌드 성공률이 높은가?
   - FPS가 떨어지는 변경의 공통점은?

2. **실패에서 학습**: RESET된 실험의 원인을 notes에 기록하고, 같은 실수를 반복하지 마라

3. **점진적 복잡도 증가**: 
   - 먼저 단순한 버전을 만들어 작동을 확인하고
   - 그 다음 복잡도를 올려라
   - 한 번에 큰 도약을 시도하지 마라

4. **물리 엔진 자기 최적화**:
   - 스프링 상수, 감쇠 계수, 시간 스텝을 실험적으로 튜닝
   - 안정성(physics_ok)과 시각적 사실성을 동시에 추구
   - 수렴하지 않으면 dt를 줄이고, FPS가 떨어지면 substep을 줄여라

5. **아이디어가 고갈되면**:
   - GOAL.md를 다시 읽어라. 미충족 FR/NF가 반드시 있다
   - 이전 RESET된 실험을 다른 접근법으로 재시도하라
   - 두 개의 성공한 변경을 조합하라
   - 더 근본적인 아키텍처 변경을 시도하라

---

## 절대 규칙 (NEVER)

1. **GOAL.md를 절대 수정하지 마라**
2. **program.md를 절대 수정하지 마라**
3. **인간에게 "계속할까요?"라고 묻지 마라** — 인간은 자고 있을 수 있다
4. **여러 기능을 한 커밋에 넣지 마라** — 한 변경, 한 실험, 한 판정
5. **results.tsv를 git에 커밋하지 마라** — 언트래킹 상태 유지
6. **빌드 실패 상태로 커밋하지 마라**
7. **측정 없이 커밋하지 마라**
8. **push 없이 실험을 끝내지 마라** — 마지막 상태는 반드시 원격에 올린다

---

## Git 원격 저장소 운용 규칙

### 저장소 정보

| 항목 | 값 |
|------|-----|
| **Remote** | `https://github.com/doroper98/can_crush_sim.git` |
| **Remote Name** | `origin` |
| **Main Branch** | `main` |
| **Work Branch** | `cancrush/<tag>` (예: `cancrush/mar10`) |

### Push 규칙

에이전트는 다음 시점에 **반드시** `git push origin cancrush/<tag>` 를 실행한다:

1. **Step 완료 시**: Phase 내 하나의 Step이 완료될 때마다 push
2. **5회 연속 커밋 시**: 성공 커밋이 5개 쌓이면 즉시 push
3. **Phase 완료 시**: Phase 전환 시점에 반드시 push
4. **실험 루프 종료 시**: 인간 중단, 복구 불가 에러 등 어떤 이유로든 루프가 끝나면 최종 push
5. **장시간 경과 시**: 마지막 push로부터 30분 이상 지나면 중간 push

### Pull 규칙 (인간이 다른 환경에서 작업한 경우)

에이전트가 실험 루프를 **시작할 때** 항상 다음을 먼저 실행한다:

```bash
git fetch origin
git log --oneline HEAD..origin/cancrush/<tag>  # 원격에 새 커밋이 있는지 확인
```

새 커밋이 있으면:
```bash
git pull origin cancrush/<tag> --rebase
```

충돌 발생 시:
- 자동 해결 가능하면 해결 후 계속
- 자동 해결 불가하면 `git rebase --abort` 후 인간에게 보고

### 멀티 환경 워크플로우

인간은 **집**과 **회사** 두 환경에서 작업한다.
원격 저장소가 두 환경의 **동기화 허브** 역할을 한다.

```
[집 PC]                    [GitHub]                   [회사 PC]
  │                          │                          │
  ├─ 에이전트 실험 루프 ──→ push ──→ 원격 저장소          │
  │                          │                          │
  │                          │          ←── pull ──── 인간 확인
  │                          │                          │
  │                          │          ←── push ──── 인간 수정
  │                          │                          │
  ├─ pull (다음 세션 시작) ←─┤                          │
  │                          │                          │
  ├─ 에이전트 실험 루프 ──→ push ──→ ...                 │
```

### 커밋 메시지 형식

```
[P{phase}/S{step}] {변경 설명}

예시:
[P1/S1.1] Vite + React + Three.js 초기 셋업
[P1/S1.3] CATIA 호환 카메라 컨트롤 구현
[P1/S1.7] Mass-Spring 물리 엔진 기초 구현
[P2/S2.1] OCCT.js WASM 통합
```

### Phase 완료 시 브랜치 정리

Phase가 완료되면:
```bash
git checkout main
git merge cancrush/<tag>
git push origin main
git checkout -b cancrush/<next-tag>  # 다음 Phase 브랜치
git push -u origin cancrush/<next-tag>
```

---

## 인간에게 보고하기

인간이 돌아왔을 때 확인할 수 있도록:

1. `results.tsv`를 읽으면 전체 실험 히스토리가 보인다
2. `git log --oneline`으로 성공한 변경들의 히스토리가 보인다
3. 현재 Phase와 Step 진행 상황을 마지막 커밋 메시지에 명시한다
   - 형식: `[Phase X / Step X.Y] 변경 설명`
   - 예시: `[P1/S1.3] CATIA 호환 카메라 컨트롤 구현`
4. **원격 저장소 동기화 상태를 확인한다**
   - `git status`로 미커밋 변경 확인
   - `git log origin/cancrush/<tag>..HEAD`로 미푸시 커밋 확인
   - 미푸시 커밋이 있으면 즉시 push 후 보고

인간이 다른 환경(회사)에서 pull 받아 즉시 작업을 이어갈 수 있도록,
**항상 원격 저장소가 최신 상태를 반영하고 있어야 한다.**

---

## 시작

이 파일을 읽었으면:

1. GOAL.md를 읽어라
2. 현재 프로젝트 상태를 파악하라 (git log, 파일 목록)
3. results.tsv에서 마지막 실험을 확인하라
4. 다음 Step이 무엇인지 판단하라
5. 실험 루프를 시작하라

**멈추지 마라. 인간이 멈출 때까지 계속하라.**
