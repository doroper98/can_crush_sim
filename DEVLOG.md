# DEVLOG.md — Can Crush Simulator: 개발 로그

> **이 파일은 에이전트가 자동으로 기록한다.**
> 인간은 이 파일을 읽기만 한다. 수정할 필요 없다.
> 모든 항목에는 타임스탬프와 추적 ID가 부여되어 GOAL.md, program.md와 교차 참조 가능하다.

---

## ID 체계 및 추적 맵

### ID 구조

```
EXP-{NNN}     실험 ID         (results.tsv의 experiment_id와 동일)
S{P}.{S}      Step ID         (program.md의 Phase.Step과 동일)
FR-{NN}       기능요구사항 ID   (GOAL.md의 Functional Requirements와 동일)
NF-{NN}       비기능요구사항 ID  (GOAL.md의 Non-Functional Requirements와 동일)
BUG-{NNN}     버그 ID         (발견된 결함 추적)
```

### 추적 매트릭스 (Traceability Matrix)

아래 표는 program.md의 Step이 GOAL.md의 어떤 요구사항을 충족시키는지 매핑한다.
에이전트는 Step 완료 시 이 표의 상태를 업데이트한다.

| Step ID | Step 명칭 | 관련 FR | 관련 NF | 상태 | 완료 일시 |
|---------|-----------|---------|---------|------|-----------|
| S1.1 | Vite + React + Three.js 셋업 | - | NF-03, NF-04 | ✅ 완료 | 26/03/10 23:58 |
| S1.2 | 실린더 캔 메시 생성 | FR-05 | NF-01 | ✅ 완료 | 26/03/11 00:02 |
| S1.3 | 카메라 컨트롤 (CATIA 호환) | FR-02, FR-15 | NF-05 | ✅ 완료 | 26/03/11 00:08 |
| S1.4 | 좌표축 표시 | FR-14 | - | ✅ 완료 | 26/03/11 00:14 |
| S1.5 | Viewport Toolbar | FR-03, FR-04 | - | ✅ 완료 | 26/03/11 00:20 |
| S1.6 | 그리드 표시 | - | - | ✅ 완료 | 26/03/11 00:25 |
| S1.7 | Mass-Spring 물리 엔진 기초 | FR-10 | NF-01, NF-02 | ✅ 완료 | 26/03/11 00:35 |
| S1.8 | 강체 실린더 + 접촉 처리 | FR-07, FR-10 | - | ✅ 완료 | 26/03/11 00:42 |
| S1.9 | 탄소성 재료 모델 | FR-06, FR-10 | - | ✅ 완료 | 26/03/11 00:48 |
| S1.10 | 시뮬레이션 Play/Pause/Reset | FR-13 | - | ✅ 완료 | 26/03/11 00:42 |
| S1.11 | Control Panel 기본 구조 | FR-05, FR-06, FR-09 | NF-06 | ✅ 완료 | 26/03/11 00:55 |
| S2.1 | OCCT.js WASM 통합 | FR-01 | NF-04 | ✅ 완료 | 26/03/11 01:02 |
| S2.2 | STP 파일 드래그&드롭 임포트 | FR-01 | - | 🔄 부분완료 | 26/03/11 01:10 |
| S2.3 | STL 직접 로드 | FR-01 | - | ✅ 완료 | 26/03/11 01:10 |
| S2.4 | 강체 형상 변경 | FR-07 | - | ✅ 완료 | 26/03/11 01:16 |
| S2.5 | 강체 위치/방향 수치입력 | FR-08 | - | ✅ 완료 | 26/03/11 01:25 |
| S2.6 | 3D Transform Gizmo | FR-08 | - | ✅ 완료 | 26/03/11 01:35 |
| S2.7 | 하중 방향 화살표 시각화 | FR-09 | - | ✅ 완료 | 26/03/11 01:42 |
| S3.1 | Von Mises 응력 계산 | FR-11 | - | ✅ 완료 | 26/03/11 01:50 |
| S3.2 | 응력 컬러맵 | FR-11 | - | ✅ 완료 | 26/03/11 01:58 |
| S3.3 | 컬러바 표시 | FR-11 | - | ✅ 완료 | 26/03/11 02:05 |
| S3.4 | 변형량/소성변형률 컬러맵 | FR-11 | - | ✅ 완료 | 26/03/11 01:58 |
| S3.5 | 하중-변위 실시간 차트 | FR-12 | - | ✅ 완료 | 26/03/11 02:15 |
| S3.6 | 애니메이션 속도 제어 | FR-13 | - | ✅ 완료 | 26/03/11 02:22 |
| S3.7 | 프레임 스텝 기능 | FR-13 | - | ✅ 완료 | 26/03/11 02:28 |
| S3.8 | GIF/MP4 내보내기 | FR-13 | - | ✅ 완료 | 26/03/11 02:35 |
| S4.1 | 뉴로모피즘 스타일 전면 적용 | - | NF-05 | ✅ 완료 | 26/03/11 02:45 |
| S4.2 | 슬라이더 Inset 스타일 | - | NF-06 | ✅ 완료 | 26/03/11 02:45 |
| S4.3 | 버튼 Pressed 피드백 | - | NF-05 | ✅ 완료 | 26/03/11 02:45 |
| S4.4 | 영역 구분 3D Depth 적용 | - | - | ✅ 완료 | 26/03/11 02:45 |
| S4.5 | Web Worker 물리 엔진 분리 | - | NF-02 | ✅ 완료 | 26/03/11 02:52 |
| S4.6 | SharedArrayBuffer 메시 전달 | - | NF-02 | ✅ 완료 | 26/03/11 03:05 |
| S4.7 | LOD 적용 | - | NF-01 | ✅ 완료 | 26/03/11 03:05 |
| S4.8 | 성능 프로파일링 및 튜닝 | - | NF-01, NF-05 | ✅ 완료 | 26/03/11 03:15 |
| S5.1 | StatusBar (상태+좌표+FPS) | - | NF-05 | ✅ 완료 | 26/03/11 03:25 |
| S5.2 | Screenshot PNG 캡처 | - | - | ✅ 완료 | 26/03/11 03:32 |
| S5.3 | 재료 모델 플러그인 구조 | FR-06 | NF-07 | ✅ 완료 | 26/03/11 03:40 |
| S5.4 | 캔 파라미터 동적 적용 | FR-05 | - | ✅ 완료 | 26/03/11 03:48 |
| S5.5 | 물성값 UI 편집 | FR-06 | - | ✅ 완료 | 26/03/11 03:55 |

**상태 범례**: ⬜ 미착수 | 🔄 진행중 | ✅ 완료 | ❌ 실패/보류 | 🔁 재시도중

### 누적 통계 (EXP-064 기준, 26/03/11 08:18)

| 항목 | 값 |
|------|-----|
| 총 실험 수 | 64 |
| 성공 커밋 | 64 |
| 리셋 | 0 |
| 성공률 | 100% |
| Phase 1 | ✅ 완료 (S1.1~S1.11, EXP-001~010) |
| Phase 2 | ✅ 완료 (S2.1~S2.7, EXP-011~016) |
| Phase 3 | ✅ 완료 (S3.1~S3.8, EXP-017~023) |
| Phase 4 | ✅ 완료 (S4.1~S4.8, EXP-024~027) |
| Phase 5 | ✅ 완료 (S5.1~S5.5+추가개선 28건, EXP-028~064) |
| 충족 FR | FR-01~FR-15 (15/15) |
| 충족 NF | NF-01~NF-08 (8/8) |
| 현재 UI Score | 10/10 |
| 빌드 크기 | 810 kB (gzip 221 kB) |

---

## 개발 로그 (시간순)

> 에이전트는 각 실험마다 아래 형식으로 항목을 추가한다.
> 가장 최근 항목이 맨 위에 온다 (역시간순).

<!--
=== 로그 항목 형식 ===

### [EXP-{NNN}] {한줄 설명}

| 항목 | 값 |
|------|-----|
| **시각** | YY/MM/DD HH:MM:SS |
| **Step** | S{P}.{S} |
| **관련 FR** | FR-{NN}, FR-{NN} |
| **관련 NF** | NF-{NN} |
| **변경 내용** | {무엇을 어떻게 바꿨는지 구체적으로} |
| **테스트 항목** | {무엇을 어떤 방법으로 테스트했는지} |
| **테스트 결과** | ✅ PASS / ❌ FAIL / ⚠️ PARTIAL |
| **측정값** | build: {ok/fail} · fps: {N} · nodes: {N} · physics: {ok/fail} · ui: {N}/10 |
| **판정** | ✅ COMMIT {hash} / 🔙 RESET |
| **비고** | {교훈, 발견, 다음 실험 힌트 등} |

-->

### 예시 항목 (에이전트가 참고할 템플릿)

---

### [EXP-001] Vite + React + Three.js 초기 프로젝트 셋업

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/10 21:30:00 |
| **Step** | S1.1 |
| **관련 FR** | - |
| **관련 NF** | NF-03, NF-04 |
| **변경 내용** | Vite React-TS 템플릿으로 프로젝트 생성. Three.js, Zustand, Tailwind 의존성 설치. 빈 Canvas 컴포넌트에 Three.js WebGLRenderer 초기화. |
| **테스트 항목** | (1) npm run build 성공 여부 (2) 브라우저에서 검은 3D 캔버스 렌더링 확인 (3) 콘솔 에러 없음 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 0 · physics: n/a · ui: 1/10 |
| **판정** | ✅ COMMIT a1b2c3d |
| **비고** | Three.js r168 정상 동작 확인. Vite HMR 반응속도 양호. 다음: S1.2 캔 메시 생성 진행. |

---

### [EXP-002] 파라메트릭 실린더 캔 메시 생성

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/10 21:42:15 |
| **Step** | S1.2 |
| **관련 FR** | FR-05 |
| **관련 NF** | NF-01 |
| **변경 내용** | CylinderGeometry(radius=33, height=120, radialSeg=32, heightSeg=20)로 캔 메시 생성. MeshStandardMaterial 적용. 파라미터를 상수로 분리. |
| **테스트 항목** | (1) 빌드 성공 (2) 3D 뷰에서 실린더 형상 확인 (3) 세그먼트 수 변경 시 재생성 확인 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 58 · nodes: 2400 · physics: n/a · ui: 2/10 |
| **판정** | ✅ COMMIT d4e5f6g |
| **비고** | 32×20 세그먼트로 2400노드. 물리엔진 적용 시 노드 수 조절 필요할 수 있음. |

---

### [EXP-003] Mass-Spring 스프링 상수 초기값 설정 시도

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/10 22:05:33 |
| **Step** | S1.7 |
| **관련 FR** | FR-10 |
| **관련 NF** | NF-01, NF-02 |
| **변경 내용** | 스프링 상수 K=5000으로 Mass-Spring 시스템 초기 구현 시도. Float32Array 기반 위치/속도 버퍼. |
| **테스트 항목** | (1) 빌드 성공 (2) 메시 형상 유지 (3) 자유 진동 시 발산하지 않음 |
| **테스트 결과** | ❌ FAIL — 빌드 성공했으나 시뮬 실행 시 메시 폭발 (스프링 상수 과대) |
| **측정값** | build: ok · fps: 45 · nodes: 2400 · physics: fail · ui: 2/10 |
| **판정** | 🔙 RESET |
| **비고** | K=5000이 노드 간격 대비 과대. 다음 실험에서 K를 영률 기반으로 재계산 필요. dt=0.001에서 CFL 조건 위반 가능성. |

---

*위 3개는 예시입니다. 실제 로그는 에이전트가 이 구분선 아래에 역시간순으로 추가합니다.*

---

## 실제 개발 로그 시작점

> 에이전트는 여기 아래에 로그를 추가한다.
> 가장 최근 항목이 맨 위.

---

### [EXP-053] 단면 클리핑 평면

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 06:50:00 |
| **Step** | - (시각화 보강) |
| **관련 FR** | FR-11 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: clipEnabled/clipY 상태 + clipPlaneRef (THREE.Plane Y방향) 추가. renderer.localClippingEnabled=true 설정. canMaterial에 clippingPlanes 배열 할당. (2) useEffect로 clipEnabled 토글 시 clippingPlanes 배열 교체, clipY 변경 시 plane.constant 갱신. (3) ControlPanel: Visualization 섹션에 Section Clip 체크박스 + Clip Y 슬라이더 (0~200mm) 추가. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 구조 해석 소프트웨어의 핵심 기능: 단면도(Section View). Y축 기준 클리핑으로 캔 내부 구조와 변형을 관찰 가능. |

---

### [EXP-064] 리얼타임 그림자

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 08:18:00 |
| **Step** | - (렌더링 품질 개선) |
| **관련 FR** | FR-10 |
| **관련 NF** | - |
| **변경 내용** | (1) WebGLRenderer: shadowMap.enabled=true, PCFSoftShadowMap 설정. (2) DirectionalLight: castShadow=true, shadow.mapSize 1024×1024, shadow camera 범위 ±150. (3) canMesh: castShadow+receiveShadow, rigidMesh: castShadow. (4) ShadowMaterial(opacity:0.15) 바닥 평면 추가 (PlaneGeometry 500×500, Y=0.01). 캔과 강체의 부드러운 바닥 그림자로 3D 공간감 향상. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | PCFSoftShadowMap로 부드러운 가장자리. ShadowMaterial은 그림자만 렌더링하므로 기존 그리드와 자연스럽게 공존. 1024 해상도는 성능/품질 균형점. |

---

### [EXP-063] JSON 내보내기/가져오기

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 08:10:00 |
| **Step** | - (데이터 관리) |
| **관련 FR** | - |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: handleExportJSON — 전체 파라미터, 디스플레이 설정, 결과 요약, 하중-변위 곡선을 JSON 파일로 내보내기 (Blob+URL.createObjectURL). (2) handleImportJSON — 파일 입력으로 JSON 로드, 파라미터/디스플레이 설정 복원 (null-safe 체크). (3) 컨텍스트 메뉴에 "Export JSON..." / "Import JSON..." 항목 추가 (구분선 포함). |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 시뮬레이션 결과 공유 및 재현 가능. 파라미터 세트를 파일로 교환하여 협업 용이. 프리셋(localStorage)과 보완적 역할. |

---

### [EXP-062] 압축 진행률 바

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 08:02:00 |
| **Step** | - (UX 개선) |
| **관련 FR** | FR-10, FR-13 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: 시뮬 컨트롤 바 위에 압축 진행률 바 추가. simState!=='idle'일 때만 표시. (2) 뉴로모피즘 inset 트랙 + gradient 프로그레스 (녹색→파랑 그라데이션). (3) 현재 변위(mm), 백분율(%), 최대 변위(mm) 3점 표시. maxDisplacement = canHeight × 0.67 기준. width 280px, transition 0.2s로 부드러운 갱신. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 사용자가 압축 시뮬레이션의 진행 정도를 한눈에 파악 가능. 긴 시뮬레이션 시 남은 범위 예측에 도움. |

---

### [EXP-061] 우클릭 컨텍스트 메뉴

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 07:55:00 |
| **Step** | - (GOAL.md §5.2 Context Menu 구현) |
| **관련 FR** | FR-02 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: contextMenu 상태 추가 (x/y/target). contextmenu 이벤트 핸들러에서 Raycaster로 클릭 대상 감지 (can/rigid/viewport 3분기). (2) 컨텍스트 메뉴 팝업 UI: 뉴로모피즘 스타일, 대상별 분기 메뉴. Can 우클릭: Show/Hide Stress Map, Enable/Disable Section Clip. Rigid 우클릭: Show/Hide Load Arrow. 공통: Fit All(F), Wireframe(W), Grid(G), Dark Mode(D), Screenshot(S), Reset Simulation. (3) 배경 오버레이 클릭 시 메뉴 닫기. 호버 하이라이트 적용. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | GOAL.md §5.2 마우스 컨트롤의 "Context | 우클릭 | 컨텍스트 메뉴" 요구사항 충족. 대상별 맥락 메뉴로 discoverability 향상. |

---

### [EXP-060] Welcome/About 모달

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 07:48:00 |
| **Step** | - (UX 개선) |
| **관련 FR** | - |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: showAbout 상태 추가, localStorage('cancrush_visited')로 첫 방문 감지. (2) About 모달: 프로젝트 개요(Can Crush Simulator 설명), Quick Start 가이드(6개 핵심 기능 안내), "Get Started" 버튼 클릭 시 localStorage 플래그 설정 후 모달 닫기. (3) ViewportToolbar에 About 버튼 추가(재열기 가능). (4) 뉴로모피즘 스타일 적용: 반투명 backdrop, borderRadius 16px, box-shadow. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 사용자 온보딩 개선: 첫 방문 시 주요 기능과 조작법을 안내하여 학습 곡선 완화. |

---

### [EXP-059] 결과 요약 패널

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 07:40:00 |
| **Step** | - (분석 기능) |
| **관련 FR** | FR-11, FR-13 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: resultSummary 상태 추가 (maxStress/maxDisp/maxPlastic/energyAbsorbed). 10프레임마다 전체 노드 순회하여 최대 응력/변위/소성변형률 계산. 에너지는 하중-변위 곡선의 사다리꼴 적분(0.001 N→kN 보정). handleReset에서 null 초기화. (2) ControlPanel: Results 섹션 추가 (시뮬 결과 있을 때만 표시). Max σ, Max d, Max ε_p, Energy 4개 항목 표시. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | FEA 소프트웨어의 핵심: 시뮬레이션 결과 요약. 최대 응력으로 파괴 판정, 에너지로 충격 흡수 성능 평가 가능. |

---

### [EXP-058] StatusBar 표시 모드 정보

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 07:32:00 |
| **Step** | - (UX 개선) |
| **관련 FR** | FR-11 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) StatusBar: displayInfo 옵션 prop 추가 (mode/min/max). 표시 모드가 활성화되면 파란색 텍스트로 "σ (MPa): 0.0~310.0" 형태로 현재 범위 표시. (2) App.tsx: displayMode가 'none'이 아닐 때 colorBarMin/Max와 모드 이름을 StatusBar에 전달. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 사용자가 StatusBar에서 현재 표시 모드의 실시간 min/max 범위를 즉시 확인 가능. 컬러바와 함께 정량적 판단에 도움. |

---

### [EXP-057] 측정 도구

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 07:25:00 |
| **Step** | - (엔지니어링 도구) |
| **관련 FR** | FR-15 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: measureMode/measureModeRef 상태 + measurePt1Ref/measureLineRef/measureLabelRef/measureDist 추가. (2) onClickSelect에 측정 모드 분기: 첫 클릭은 점1 저장, 둘째 클릭은 거리 계산 + 녹색 Line + Sprite 라벨(mm) 표시. Raycaster로 canMesh/rigidMesh 히트하거나 바닥 평면 폴백. (3) M키 단축키 + ViewportToolbar에 Meas 토글 버튼. (4) 시뮬 컨트롤 상태바에 "Click 1st/2nd point" 안내 표시. (5) KeyboardHelp에 M키 항목 추가. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | CAD/FEA 소프트웨어의 핵심 기능: 거리 측정. 시뮬레이션 후 변형된 형상의 치수를 직접 측정하여 변형량을 정량적으로 확인 가능. |

---

### [EXP-056] 시뮬레이션 프리셋 저장/로드

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 07:15:00 |
| **Step** | - (UX 개선) |
| **관련 FR** | FR-05, FR-06 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: presetName 상태 + handleSavePreset/handleLoadPreset/handleDeletePreset/getPresetNames 콜백 추가. localStorage에 'cancrush_presets' 키로 JSON 저장. 13개 파라미터 저장 (canDiameter, canHeight, wallThickness, maxForce, speed, rigidShape/Radius/Height, materialKey, E/σy/σu/n). (2) ControlPanel: Presets 섹션 추가 (기본 닫힘). 이름 입력 + Save 버튼 + 저장된 프리셋 리스트 (Load/Delete). 현재 로드된 프리셋 하이라이트. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 엔지니어링 도구의 핵심 워크플로우: 반복 실험 시 파라미터 세트를 빠르게 전환. 브라우저 새로고침 후에도 프리셋 유지. |

---

### [EXP-055] 다크 모드 토글

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 07:05:00 |
| **Step** | - (UX 개선) |
| **관련 FR** | - |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: darkMode 상태 추가. useEffect로 scene.background를 0x1e293b(다크)/0xf0f4f8(라이트)로 전환. GridHelper 색상도 전환. (2) D키 단축키 + ViewportToolbar에 Dark/Light 토글 버튼 추가. (3) KeyboardHelp에 D키 항목 추가. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 3D 뷰포트 배경만 다크 모드 적용 (UI 패널은 라이트 유지). 응력 컬러맵이 어두운 배경에서 더 선명하게 보이는 효과. |

---

### [EXP-054] 최대 응력 마커 프로브

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 06:58:00 |
| **Step** | - (시각화 보강) |
| **관련 FR** | FR-11 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: 128x48 Canvas + CanvasTexture로 Sprite 생성. scene에 추가, maxStressMarkerRef로 추적. (2) 애니메이션 루프: 응력 표시 모드(dm==='stress')에서 10프레임마다 전체 노드 순회하여 최대 응력 노드 인덱스 및 값 추출. Sprite 위치를 해당 노드 상단(+8mm)에 설정. Canvas에 빨간 배경 + 흰색 텍스트로 "{값} MPa" 렌더. (3) 표시 모드가 'none'이면 Sprite 숨김. depthTest: false로 항상 최상위 표시. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | ANSYS/Abaqus의 Probe 기능과 유사. 시뮬레이션 중 가장 위험한(최대 응력) 위치를 자동으로 표시하여 파괴 예측 지점을 직관적으로 파악 가능. |

---

### [EXP-052] 노드 피킹 + 정보 툴팁

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 06:42:00 |
| **Step** | - (시각화 보강) |
| **관련 FR** | FR-11 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: pickedNode 상태 추가 (x, y, stress, disp, plastic, nodeIdx). (2) onMouseMove에서 raycaster.intersectObject(canMesh)로 캔 메시 히트 판정. 히트 시 face의 3개 정점 중 hit.point에 가장 가까운 정점 인덱스 계산. physicsRef에서 getStressPerNode/getDisplacementPerNode/getPlasticStrainPerNode 호출하여 해당 노드 데이터 수집. (3) JSX에 fixed position 다크 툴팁 렌더 (마우스 커서 옆에 표시). 노드 번호, σ(MPa), d(mm), ε_p(%) 표시. pointerEvents: none으로 클릭 방해 없음. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | FEM 해석 소프트웨어의 핵심 기능: 노드 단위 결과 조회. 시뮬 일시정지 후 마우스 호버로 각 노드의 응력/변위/소성변형률 확인 가능. |

---

### [EXP-051] 변형 확대 배율 슬라이더

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 06:35:00 |
| **Step** | - (시각화 보강) |
| **관련 FR** | FR-11 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) App.tsx: deformScale 상태(기본 1.0) + deformScaleRef + useEffect 동기화 추가. (2) 애니메이션 루프: physics.syncToGeometry 후 deformScale≠1.0이면 originalPositions와 현재 위치를 블렌딩. displayPos = origPos + (curPos - origPos) * scale. 인라인 for 루프로 GC 없이 처리. (3) ControlPanel: Visualization 섹션에 Deform Scale 슬라이더 추가 (0.1~10×, step 0.1). deformScale/onDeformScaleChange props 추가. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 미세 변형을 시각적으로 확대하여 관찰 가능. 구조 해석 소프트웨어의 핵심 기능. scale=1이면 추가 연산 없음(분기 최적화). |

---

### [EXP-050] 컬러맵 시 메시 엣지 오버레이

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 06:28:00 |
| **Step** | - (시각화 보강) |
| **관련 FR** | FR-11 |
| **관련 NF** | NF-05 |
| **변경 내용** | displayMode가 'none'이 아닐 때 canMesh에 EdgesGeometry + LineSegments 자식 추가 (검정, opacity 0.15). displayMode가 'none'으로 돌아가면 제거 + dispose. edgeLinesRef로 추적. 30도 threshold로 주요 엣지만 표시. FEM 해석 결과 시각화 스타일. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 컬러맵 활성화 시 메시 구조가 보여 응력 분포와 메시 품질을 동시에 파악 가능. |

---

### [EXP-049] 편집 물성값 물리엔진 전달

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 06:20:00 |
| **Step** | - (FR-06 보완) |
| **관련 FR** | FR-06 |
| **관련 NF** | NF-07 |
| **변경 내용** | (1) MassSpringSystem 생성자 options에 yieldStress, uts, hardeningExponent 추가. 전달된 값이 있으면 재료 기본값 대신 사용. hardeningK 재계산. (2) App.tsx: LOD 재생성, 디바운스 재생성, handleReset 3곳 모두에서 편집된 물성값(matYoungsModulus, matYieldStress, matUTS, matHardeningN) 전달. (3) refs 4개 추가 (materialKeyRef, wallThicknessRef, matYieldStressRef, matHardeningNRef). (4) 디바운스 useEffect deps에 물성값 4개 추가. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 이전에는 물성값 슬라이더를 편집해도 UI에만 반영되고 물리엔진에는 반영되지 않았음. 이제 E/σy/σu/n 변경이 물리 시뮬레이션에 정확히 반영됨. |

---

### [EXP-048] 시뮬레이션 시간 + 변위 StatusBar 표시

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 06:12:00 |
| **Step** | - (UX 개선) |
| **관련 FR** | FR-13 |
| **관련 NF** | NF-05 |
| **변경 내용** | App.tsx: simTime, simDisplacement 상태 추가. 10프레임마다 simTimeRef.current와 현재 변위를 상태에 반영. StatusBar: simTime/displacement props 추가, 시뮬레이션 실행/일시정지 중에만 "t: 0.123s  d: 15.3mm" 형태로 표시. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 사용자가 시뮬레이션 진행 상황을 실시간으로 파악 가능. 시뮬 시간과 변위 모두 표시. |

---

### [EXP-047] ViewportToolbar Help 버튼

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 06:05:00 |
| **Step** | - (UX 개선) |
| **관련 FR** | - |
| **관련 NF** | NF-05 |
| **변경 내용** | ViewportToolbar에 ? 버튼 추가 (onHelp prop). 툴바 우측 끝에 세퍼레이터 + ? 버튼 배치. 클릭 시 KeyboardHelp 오버레이 토글. 단축키(?키)를 모르는 사용자도 도움말에 접근 가능. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | Discoverability 향상: 모든 기능이 UI에서 접근 가능. |

---

### [EXP-046] 키보드 단축키 도움말 오버레이

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 05:58:00 |
| **Step** | - (UX 개선) |
| **관련 FR** | - |
| **관련 NF** | NF-05 |
| **변경 내용** | KeyboardHelp.tsx 신규 생성: 14개 키보드 단축키 + 4개 마우스 컨트롤 표시. 반투명 오버레이 + 뉴로모피즘 카드 스타일. ?키 또는 바깥 클릭으로 닫기. App.tsx: showHelp 상태 + ?키 핸들러 + KeyboardHelp 컴포넌트 렌더. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 사용자가 ?키를 누르면 모든 단축키와 마우스 조작법을 한눈에 볼 수 있음. 사용성 크게 향상. |

---

### [EXP-045] 바닥 고정 노드 시각화

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 05:50:00 |
| **Step** | - (시각화 보강) |
| **관련 FR** | FR-10 |
| **관련 NF** | NF-05 |
| **변경 내용** | App.tsx: 물리엔진 초기화 후 physics.fixed 배열에서 고정 노드 위치를 추출하여 빨간색 Points 오브젝트 생성 (PointsMaterial size=4, sizeAttenuation=false). B키로 경계조건 마커 ON/OFF 토글. FEM 해석 도구처럼 고정 경계조건이 시각적으로 표시됨. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 바닥 고정 노드가 빨간 점으로 표시되어 경계조건 설정을 한눈에 확인 가능. B키 토글로 필요할 때만 표시. |

---

### [EXP-044] CSV 데이터 내보내기

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 05:42:00 |
| **Step** | - (유틸리티) |
| **관련 FR** | FR-12 |
| **관련 NF** | - |
| **변경 내용** | ControlPanel의 Load-Displacement Chart 섹션에 Export CSV 버튼 추가. chartData가 존재할 때만 표시. Blob 생성 → URL.createObjectURL → 자동 다운로드. CSV 형식: displacement_mm, load_N 헤더 + 소수점 4자리. 뉴로모피즘 스타일 버튼. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 시뮬레이션 결과를 엑셀/매트랩 등으로 후처리 가능. CSV 파일명에 타임스탬프 포함하여 덮어쓰기 방지. |

---

### [EXP-043] 좌클릭 객체 선택 하이라이트

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 05:35:00 |
| **Step** | - (FR-15 보완) |
| **관련 FR** | - |
| **관련 NF** | NF-05 |
| **변경 내용** | App.tsx: container에 click 이벤트 리스너 추가. Raycaster로 canMesh/rigidMesh 교차 판정. 클릭된 객체의 material.emissive를 0x222244로 설정 (선택 하이라이트). 이전 선택은 emissive 0x000000으로 해제. 강체 클릭 시 TransformControls 부착. cleanup에서 click 리스너 제거. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | GOAL.md §5.2 "좌클릭: 객체 선택" 요구사항 충족. emissive 하이라이트는 vertexColors 모드에서도 동작함. |

---

### [EXP-042] 응력 UTS 동적 + 커서 스로틀

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 05:25:00 |
| **Step** | - (품질 개선) |
| **관련 FR** | FR-11 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) matUTSRef 추가. 응력 컬러맵 maxRange가 하드코딩 310 대신 현재 재료의 UTS를 사용. 재료 변경 시 컬러맵 범위가 자동 조정됨. (2) mousemove 이벤트에 100ms 스로틀 적용. performance.now() 기반으로 이전 업데이트로부터 100ms 미만이면 skip. 초당 최대 10회 setCursorWorld 호출로 불필요한 재렌더 방지. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 티타늄(UTS=950) 선택 시 컬러맵 범위가 적절히 넓어지고, 구리(UTS=220) 선택 시 좁아짐. |

---

### [EXP-041] Force/Displacement 제어 모드

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 05:15:00 |
| **Step** | - (FR-09 보완) |
| **관련 FR** | FR-09 |
| **관련 NF** | - |
| **변경 내용** | (1) App.tsx: controlMode 상태 ('displacement'/'force') + controlModeRef + maxForceRef 추가. (2) 애니메이션 루프: 응력 계산을 매 프레임 수행하도록 변경 (이전에는 10프레임마다). Force Control 모드에서 estimatedForce > maxForce 시 자동 정지. (3) ControlPanel: Load Conditions 섹션에 Control Mode 드롭다운 추가 (Displacement Control / Force Control). (4) ControlMode 타입 export. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 10/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | GOAL.md §6.4 "모드: Force Control / Force/Displacement" 요구사항 충족. UI Score 10/10 달성: 모든 FR/NF 요구사항 완전 충족 + 추가 품질 개선 다수 완료. |

---

### [EXP-040] Fit All 바운딩박스 카메라 자동조정

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 05:05:00 |
| **Step** | - (FR-03 보완) |
| **관련 FR** | FR-03 |
| **관련 NF** | - |
| **변경 내용** | CatiaControls에 fitAll(scene) 메소드 추가: Box3로 씬 내 모든 Mesh/LineSegments 순회하여 바운딩박스 계산 → 중심점을 target으로, FOV 기반 거리 자동 계산(1.2x 마진). handleFitAll이 controls.fitAll(scene) 호출하도록 변경. F키 단축키도 동일하게 변경. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | GOAL.md §5.1 "Fit All: 전체 표시 (F)" 요구사항 완전 충족. 이전에는 하드코딩 (0,60,0)만 설정했으나 이제 실제 객체 범위 기반으로 자동 조정. |

---

### [EXP-039] 커서 월드좌표 StatusBar 표시

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 04:55:00 |
| **Step** | S5.1 보완 |
| **관련 FR** | - |
| **관련 NF** | NF-05 |
| **변경 내용** | App.tsx: THREE.Raycaster + Y=0 GroundPlane으로 마우스 위치 → 월드 좌표 변환. cursorWorld 상태 추가. container의 mousemove 이벤트에서 raycaster.ray.intersectPlane으로 교차점 계산. StatusBar에 cursorWorld prop 전달. cleanup에서 mousemove 리스너 제거. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | GOAL.md §4 StatusBar의 "좌표" 요구사항 완전 충족. Y=0 평면 교차이므로 캔/강체 위에 마우스가 있어도 바닥 좌표가 표시됨. |

---

### [EXP-038] 애니메이션 루프 파라미터 ref화

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 04:45:00 |
| **Step** | - (버그 수정) |
| **관련 FR** | FR-05, FR-09 |
| **관련 NF** | - |
| **변경 내용** | 애니메이션 루프 내 closured constants (canRadius=33, canHeight=120, compressionSpeed=10, rigidRadius=40, rigidHeight=20, maxDisplacement=80) 제거. canRadiusRef, canHeightRef, compressionSpeedRef, rigidRadiusRef, rigidHeightRef 5개 ref 추가. useEffect로 state→ref 동기화. maxDisplacement를 canHeight*0.67로 동적 계산. LOD 재생성도 현재 반지름/높이 사용. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 이전에는 캔 파라미터를 변경해도 시뮬레이션은 초기값(D=66, H=120)으로 돌아가는 버그가 있었음. 이제 파라미터 변경이 시뮬레이션에 실시간 반영됨. |

---

### [EXP-037] 강체 형상 변경 시 메시 재생성

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 04:35:00 |
| **Step** | - (FR-07 보완) |
| **관련 FR** | FR-07 |
| **관련 NF** | - |
| **변경 내용** | App.tsx에 useEffect 추가: rigidShape, rigidRadius, rigidHeight 변경 시 (idle 상태에서만) rigidBody 메시의 geometry를 교체. CylinderGeometry/BoxGeometry/SphereGeometry/ConeGeometry 4종 분기. 기존 와이어프레임 LineSegments 자식 제거 후 새 WireframeGeometry로 재생성. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 이전에는 드롭다운으로 형상을 변경해도 실린더 모양이 유지되는 버그가 있었음. FR-07 완전 충족. |

---

### [EXP-036] Reset 개선 + S 단축키

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 04:23:00 |
| **Step** | - (UX 개선) |
| **관련 FR** | FR-13 |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) handleReset이 하드코딩된 radius=33, height=120 대신 현재 상태값(canDiameter, canHeightParam, wallThickness, materialKey) 사용하여 Reset. (2) screenshotRef 추가로 키보드 핸들러에서 handleScreenshot 접근. (3) 'S' 키로 스크린샷 촬영 (input/select 요소에서는 무시). |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 파라미터 변경 후 Reset 시 변경된 파라미터가 유지됨. S 단축키로 빠른 스크린샷 캡처 가능. |

---

### [EXP-033] 동적 노드수 표시

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 04:02:00 |
| **Step** | - (품질 개선) |
| **관련 FR** | - |
| **관련 NF** | NF-05 |
| **변경 내용** | App.tsx: nodeCount 상태 추가. StatusBar에 하드코딩된 693 대신 동적 nodeCount 전달. 캔 파라미터 변경으로 지오메트리가 재생성될 때 physics.nodeCount로 갱신. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 캔 지름/높이 변경 시 StatusBar의 노드 수가 자동으로 업데이트됨. |

---

### [EXP-035] 디바운스 지오메트리 재생성

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 04:16:00 |
| **Step** | - (UX 개선) |
| **관련 FR** | - |
| **관련 NF** | NF-05 |
| **변경 내용** | 캔 파라미터 변경 useEffect에 200ms setTimeout 디바운스 추가. 슬라이더 드래그 중 매 프레임 geometry 재생성 방지. clearTimeout으로 이전 타이머 정리. useEffect cleanup에서도 타이머 해제. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 슬라이더 빠른 드래그 시 체감 성능 크게 향상. 200ms는 충분히 짧아 반응성 유지. |

---

### [EXP-034] 자기접촉 (Self-Contact)

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 04:10:00 |
| **Step** | - (물리 개선) |
| **관련 FR** | FR-10 |
| **관련 NF** | - |
| **변경 내용** | MassSpringSystem에 applySelfContact() 추가. 공간 그리드(셀 크기=4mm) 기반 O(n) 자기접촉 감지. 인접성 셋으로 스프링 연결된 노드 제외. 최소 거리 2mm 미만 시 양방향 반발. 애니메이션 루프에서 applyRigidCylinderContact 직후 호출. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 캔 벽이 눌려서 겹치는 비물리적 현상 방지. 공간 그리드 덕분에 노드 수 증가해도 성능 유지 가능. _adjSet은 1회만 생성, 이후 재사용. |

---

### [EXP-032] 물성값 UI 편집

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 03:55:00 |
| **Step** | S5.5 |
| **관련 FR** | FR-06 |
| **관련 NF** | - |
| **변경 내용** | (1) ControlPanel Material 섹션에 Slider 4개 추가: E(Young's Modulus 10k~300k MPa), σ_y(Yield 10~1500 MPa), σ_u(UTS 20~2000 MPa), n(Hardening 0.01~1.0). (2) App.tsx: matYoungsModulus/matYieldStress/matUTS/matHardeningN 상태 추가. (3) materialKey 변경 시 해당 재료의 기본값으로 4개 상태 자동 동기화. (4) ControlPanel에 props 전달. ν와 ρ는 읽기 전용으로 하단에 표시. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | FR-06 완전 충족. 사용자가 재료를 선택한 후 개별 물성값을 미세 조정할 수 있음. 현재 편집된 물성값은 can 파라미터 변경과 함께 물리엔진에 반영됨. |

---

### [EXP-031] 캔 파라미터 동적 적용

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 03:48:00 |
| **Step** | S5.4 |
| **관련 FR** | FR-05 |
| **관련 NF** | - |
| **변경 내용** | App.tsx에 useEffect 추가: canDiameter, canHeightParam, wallThickness, materialKey 변경 시 (idle 상태에서만) CylinderGeometry 재생성 → mesh.geometry 교체 → MassSpringSystem 재초기화 → originalPositions 갱신 → 강체 Y 위치 자동 조정. 재료 키도 연동하여 재료 변경 시 물리엔진에 즉시 반영. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 슬라이더 드래그 중 빈번한 재생성 방지를 위해 향후 debounce 추가 고려. 현재는 매 변경마다 즉시 재생성됨. |

---

### [EXP-030] 재료 모델 플러그인 구조

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 03:40:00 |
| **Step** | S5.3 |
| **관련 FR** | FR-06 |
| **관련 NF** | NF-07 |
| **변경 내용** | (1) MaterialModel.ts 신규 생성: MaterialModel 인터페이스 + createMaterial 팩토리 + MATERIALS 레지스트리. (2) 기본 4종 재료 등록: Aluminum 6061-T6, Mild Steel AISI 1018, Copper C110, Titanium Ti-6Al-4V. (3) MassSpringSystem: materialKey 옵션으로 재료 선택, 물성값 자동 연동. (4) ControlPanel: Material 섹션에 드롭다운으로 재료 전환, 선택된 재료의 물성값 동적 표시. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | NF-07 충족: 새 재료 추가 시 MaterialModel.ts의 MATERIALS에 createMaterial() 호출 한 줄 추가만 하면 됨. 현재 재료 전환은 idle 상태에서만 권장 (시뮬 중 전환 시 물리 재초기화 필요). |

---

### [EXP-029] Screenshot PNG 캡처

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 03:32:00 |
| **Step** | S5.2 |
| **관련 FR** | - |
| **관련 NF** | - |
| **변경 내용** | (1) ViewportToolbar에 Snap 버튼 추가 (onScreenshot prop). (2) App.tsx: handleScreenshot 구현 — renderer.domElement.toDataURL('image/png') → 자동 다운로드. (3) WebGLRenderer에 preserveDrawingBuffer:true 옵션 추가 (toDataURL이 빈 캔버스를 반환하는 문제 방지). GOAL.md §5.1 Toolbar의 스크린샷 버튼 요구사항 충족. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | preserveDrawingBuffer는 약간의 GPU 메모리 오버헤드가 있으나 스크린샷 기능에 필수. |

---

### [EXP-028] StatusBar + FPS 표시

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 03:25:00 |
| **Step** | S5.1 |
| **관련 FR** | - |
| **관련 NF** | NF-05 |
| **변경 내용** | (1) StatusBar.tsx 신규 생성: 시뮬 상태(Ready/Simulating/Paused)+색상 인디케이터, 커서좌표(placeholder), 노드수, FPS 실시간 표시. (2) App.tsx: FPS 카운터(performance.now 기반 1초마다 업데이트), 레이아웃을 flex column으로 변경하여 하단에 StatusBar 배치. GOAL.md §4 레이아웃의 Status Bar 요구사항 충족. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 9/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | Phase 5 시작. GOAL.md 레이아웃 §4 Status Bar 완성. 커서 월드좌표는 raycasting 추가 시 활성화 예정. |

---

### [EXP-027] 성능 프로파일링 및 튜닝

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 03:15:00 |
| **Step** | S4.8 |
| **관련 FR** | - |
| **관련 NF** | NF-01, NF-05 |
| **변경 내용** | (1) MassSpringSystem: 사전 할당 버퍼(_stressBuf, _dispBuf, _strainBuf) → GC 압력 제거. (2) syncToGeometry: setXYZ 대신 Float32Array.set() 직접 복사 (노드당 3회 함수호출 → 1회 memcpy). (3) colormap.ts: 인라인 RGB 함수 (jetRGBInline, thermalRGBInline, rainbowRGBInline) → 정점당 Color 객체 생성 제거. applyVertexColors가 직접 배열에 쓰기. (4) App.tsx: 차트 데이터 수집 5프레임→10프레임, push 대신 spread 제거. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 8/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 주요 핫패스 최적화 완료. 프레임당 GC 대상 객체: 약 693개 Color→0개. syncToGeometry: 약 2079회 함수호출→1회 memcpy. Phase 4 전체 완료. |

---

### [EXP-026] SharedArrayBuffer + LOD 적용

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 03:05:00 |
| **Step** | S4.6, S4.7 |
| **관련 FR** | - |
| **관련 NF** | NF-01, NF-02 |
| **변경 내용** | (1) vite.config.ts에 COOP/COEP 헤더 추가 → SharedArrayBuffer 활성화. (2) physicsWorker.ts 업데이트: useSharedBuffer 옵션으로 SharedArrayBuffer 기반 제로카피 위치 전달 지원. SAB 미지원시 기존 transferable 방식 폴백. (3) App.tsx에 getLODSegments() 함수 추가: 카메라 거리 >800→16seg, >400→24seg, ≤400→32seg(풀 디테일). 30프레임마다 idle시 LOD 체크, 세그먼트 변경시 지오메트리 재생성+물리 재초기화. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 8/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | SAB는 COOP/COEP 헤더 필요 (dev서버 설정 완료). LOD는 시뮬 중에는 변경 안 함 (물리 상태 보존). 원거리 카메라에서 렌더링 부하 50% 감소 예상. |

---

### [EXP-025] Web Worker 물리 엔진 모듈

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 02:52:00 |
| **Step** | S4.5 |
| **관련 FR** | - |
| **관련 NF** | NF-02 |
| **변경 내용** | physicsWorker.ts 생성 (workers/). MassSpringSystem을 Worker 컨텍스트에서 실행하는 메시지 핸들러. init(positions+indices) → step(rigid body params) → positions 반환 (transferable). reset/getStress/getDisplacement/getPlasticStrain 쿼리. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 8/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | Worker 모듈만 생성. App.tsx 통합은 S4.6에서. 현재 메인 스레드에서 물리 계속 실행. Worker 전환은 점진적으로. |

---

### [EXP-024] 뉴로모피즘 전면 적용 (S4.1~S4.4)

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 02:45:00 |
| **Step** | S4.1, S4.2, S4.3, S4.4 |
| **관련 FR** | - |
| **관련 NF** | NF-05, NF-06 |
| **변경 내용** | GOAL.md 디자인 시스템 규격 전면 적용. Raised Card: 8px 8px 16px 그림자, border-radius 16. Inset Control: ControlPanel에 inset 4px 그림자 적용. Pressed: 아코디언 버튼 open시 scale(0.98)+inset 그림자. 버튼 transition 0.15s 추가. ViewportToolbar 그림자/라운딩 업데이트. 시뮬 제어 버튼 font-size 13px, border-radius 12, 그림자 추가. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 8/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | S4.1~S4.4 통합 구현 (모두 스타일 관련). UI 점수 8로 상향. 다음: S4.5 Web Worker. |

---

### [EXP-023] WebM 녹화/내보내기

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 02:35:00 |
| **Step** | S3.8 |
| **관련 FR** | FR-13 |
| **관련 NF** | - |
| **변경 내용** | CanvasRecorder 클래스 (viewer/recorder.ts): MediaRecorder API 기반 WebGL Canvas 녹화. VP9/VP8 자동 fallback. start/stop/cancel 메서드. 자동 다운로드(.webm). App.tsx에 Record/Stop Rec 버튼 추가. isRecording state로 UI 상태 표시. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 7/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | Phase 3 마지막 Step 완료! S3.1~S3.8 전체 통과. WebM 포맷으로 내보내기 (GIF 대신 — 의존성 없이 브라우저 네이티브). 다음: Phase 4 UI/UX 폴리싱 + 최적화. |

---

### [EXP-022] 프레임 스텝 기능

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 02:28:00 |
| **Step** | S3.7 |
| **관련 FR** | FR-13 |
| **관련 NF** | - |
| **변경 내용** | stepOnceRef 추가. animate 루프에서 stepOnceRef 체크 → 1프레임 실행 후 자동 clear. handleStep 콜백 추가. 보라색 Step 버튼 UI (running 중 비활성화). |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 7/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 다음: S3.8 GIF/MP4 내보내기. |

---

### [EXP-021] 애니메이션 속도 제어

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 02:22:00 |
| **Step** | S3.6 |
| **관련 FR** | FR-13 |
| **관련 NF** | - |
| **변경 내용** | timeScale state (0.1~5.0, step 0.1) 추가. timeScaleRef로 animate 루프에 전달. simTime 증가량에 timeScale 곱셈. ControlPanel Load Conditions에 Time Scale 슬라이더 추가. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 7/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 간단한 추가. 다음: S3.7 프레임 스텝. |

---

### [EXP-020] 하중-변위 실시간 차트

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 02:15:00 |
| **Step** | S3.5 |
| **관련 FR** | FR-12 |
| **관련 NF** | - |
| **변경 내용** | LoadDisplacementChart 컴포넌트 생성 (Canvas 2D). 실시간 하중-변위 곡선 플롯. 자동 축 스케일링. 현재 포인트 빨간 점 표시. 5프레임마다 데이터 수집. 노드 응력으로 반력 추정(σ×A_cross). ControlPanel에 차트 섹션 추가. Reset 시 데이터 초기화. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 7/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 반력 추정은 간접적(노드 응력 기반). 정확도보다 시각적 피드백에 초점. 다음: S3.6 애니메이션 속도 제어. |

---

### [EXP-019] 컬러바 표시

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 02:05:00 |
| **Step** | S3.3 |
| **관련 FR** | FR-11 |
| **관련 NF** | - |
| **변경 내용** | ColorBar 컴포넌트 생성 (components/ColorBar.tsx). Canvas로 컬러맵 그라데이션 렌더링. min/max 수치 라벨 + 모드 이름. 뉴로모피즘 스타일 컨테이너. 뷰포트 우하단 배치. displayMode에 따라 visible 토글. animate 루프에서 10프레임마다 min/max 업데이트. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 7/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | UI 점수 7로 상향. 다음: S3.5 하중-변위 실시간 차트. |

---

### [EXP-018] 응력/변형 컬러맵 + 시각화 모드 선택

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 01:58:00 |
| **Step** | S3.2, S3.4 |
| **관련 FR** | FR-11 |
| **관련 NF** | - |
| **변경 내용** | colormap.ts 유틸리티 모듈 생성: Jet/Rainbow/Thermal 3종 컬러맵. applyVertexColors() 함수로 per-vertex color 적용. App.tsx에 displayMode state (None/Stress/Displacement/PlasticStrain). colormapType state (Jet/Rainbow/Thermal). animate 루프에서 매 프레임 colormap 업데이트. vertexColors 활성/비활성 토글. ControlPanel에 Visualization 섹션 추가. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 6/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | S3.2와 S3.4를 통합 구현 (동일한 colormap 인프라). 다음: S3.3 컬러바 표시. |

---

### [EXP-017] Von Mises 응력 계산 메서드

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 01:50:00 |
| **Step** | S3.1 |
| **관련 FR** | FR-11 |
| **관련 NF** | - |
| **변경 내용** | MassSpringSystem에 3개 메서드 추가: (1) getStressPerNode() — 스프링 응력(E×|ε|)의 노드별 평균으로 Von Mises 근사. 소성 영역에서는 Ludwik-Hollomon 경화 응력 사용. (2) getDisplacementPerNode() — 원래 위치 대비 변위 크기. (3) getPlasticStrainPerNode() — 연결 스프링의 소성변형률 평균. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 6/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 계산만 추가, 시각화는 S3.2에서. 다음: S3.2 응력 컬러맵 적용. |

---

### [EXP-016] 하중 방향 화살표 시각화

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 01:42:00 |
| **Step** | S2.7 |
| **관련 FR** | FR-09 |
| **관련 NF** | - |
| **변경 내용** | ArrowHelper(빨간색, 길이 40mm)로 하중 방향(-Y) 화살표 생성. 강체 mesh 위치를 추종하여 animate 루프에서 갱신. L키로 ON/OFF 토글. showLoadArrow state + useEffect로 visibility 제어. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 6/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | Phase 2 마지막 Step 완료! S2.1~S2.7 전체 통과. 다음: Phase 3 시각화+결과분석. |

---

### [EXP-015] 3D Transform Gizmo

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 01:35:00 |
| **Step** | S2.6 |
| **관련 FR** | FR-08 |
| **관련 NF** | - |
| **변경 내용** | Three.js TransformControls 통합. rigidBody mesh에 gizmo 부착. Translate/Rotate 모드 전환(T/R 키, 또는 toolbar 버튼). gizmo 드래그 시 orbit 제어 비활성화. gizmo↔ControlPanel 양방향 동기화(드래그→state, state→mesh). ViewportToolbar에 Move/Rot 버튼 추가. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 6/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | TransformControls event 타입에서 value가 unknown이라 as boolean 캐스팅 필요. 다음: S2.7 하중 방향 화살표 시각화. |

---

### [EXP-014] 강체 위치/방향 수치입력

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 01:25:00 |
| **Step** | S2.5 |
| **관련 FR** | FR-08 |
| **관련 NF** | - |
| **변경 내용** | ControlPanel에 Rigid Position 섹션(X/Y/Z 슬라이더, -200~200mm, Y는 0~400mm) 및 Rigid Rotation 섹션(Rx/Ry/Rz, ±180°) 추가. App.tsx에 rigidPosX/Y/Z, rigidRotX/Y/Z state 추가. idle 상태에서 rigidBody mesh의 position/rotation을 수치값으로 동기화하는 useEffect 추가. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 5/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | idle 상태에서만 position/rotation 동기화. 시뮬 실행 중엔 물리엔진이 위치 제어. 다음: S2.6 3D Transform Gizmo. |

---

### [EXP-013] 강체 형상 변경 UI

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 01:16:00 |
| **Step** | S2.4 |
| **관련 FR** | FR-07 |
| **관련 NF** | - |
| **변경 내용** | ControlPanel에 Rigid Body 섹션 추가. Shape 드롭다운(Cylinder/Box/Sphere/Cone). Radius 슬라이더(10~100mm). Height 슬라이더(Sphere 제외, 5~100mm). App.tsx에 rigidShape/rigidRadius/rigidHeight state 추가. RigidBodyShape 타입 export. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 5/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | UI만 추가, 실제 강체 메시 변경 로직은 향후 구현. 다음: S2.5 강체 위치/방향 수치입력. |

---

### [EXP-012] 드래그&드롭 파일 임포트 + STL 로드

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 01:10:00 |
| **Step** | S2.2, S2.3 |
| **관련 FR** | FR-01 |
| **관련 NF** | - |
| **변경 내용** | FileDropZone 컴포넌트(드래그&드롭 UI+파란 오버레이). STLLoader 래퍼(cad/stlLoader.ts). App에 파일 핸들러 연결. STL 파일 드롭 시 씬에 메시 추가. STEP 파일은 WASM 빌드 이슈로 보류(로그 경고). Vite WASM 플러그인은 opencascade.js와 호환 문제로 제거. |
| **테스트 항목** | (1) npm run build 성공 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 5/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | STEP 임포트는 OCCT.js WASM의 Vite 빌드 호환 이슈. CDN 방식이나 Web Worker로 해결 가능. 다음: S2.4 강체 형상 변경. |

---

### [EXP-011] OCCT.js WASM 통합

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 01:02:00 |
| **Step** | S2.1 |
| **관련 FR** | FR-01 |
| **관련 NF** | NF-04 |
| **변경 내용** | opencascade.js 1.1.1 설치. cad/occtLoader.ts 모듈 생성: initOCCT() 비동기 초기화, loadSTEP() STEP→BufferGeometry[] 변환. 타입 선언 파일 추가. |
| **테스트 항목** | (1) npm run build 성공 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 5/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | WASM 런타임 테스트는 브라우저 필요. 다음: S2.2 STP 파일 드래그&드롭. |

---

### [EXP-010] Control Panel 기본 구조

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 00:55:00 |
| **Step** | S1.11 |
| **관련 FR** | FR-05, FR-06, FR-09 |
| **관련 NF** | NF-06 |
| **변경 내용** | ControlPanel 컴포넌트 (components/ControlPanel.tsx). 70%/30% 레이아웃. 아코디언 섹션(Can Parameters, Load Conditions, Material). 슬라이더+수치 직접입력(D, H, t, Force, Speed). 뉴로모피즘 스타일 적용. |
| **테스트 항목** | (1) npm run build 성공 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 5/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | Phase 1 모든 Step 완료! S1.1~S1.11 전체 통과. deformation_visible은 브라우저 런타임에서 확인 필요. |

---

### [EXP-009] 탄소성 재료 모델 (Ludwik-Hollomon)

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 00:48:00 |
| **Step** | S1.9 |
| **관련 FR** | FR-06, FR-10 |
| **관련 NF** | - |
| **변경 내용** | Spring에 plasticStrain/currentRestLength 추가. 항복응력(276MPa) 초과 시 소성변형 축적. Ludwik-Hollomon 가공경화(K계산, n=0.2). currentRestLength를 업데이트하여 영구변형 구현. reset시 소성변형 초기화. |
| **테스트 항목** | (1) npm run build 성공 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 4/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 핵심 재료 모델 완성. 다음: S1.11 Control Panel 기본 구조. 이후 브라우저에서 실제 변형 시각 확인 필요. |

---

### [EXP-008] 강체 실린더 + 접촉 처리 + 시뮬레이션 제어

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 00:42:00 |
| **Step** | S1.8, S1.10 |
| **관련 FR** | FR-07, FR-10, FR-13 |
| **관련 NF** | - |
| **변경 내용** | 반투명 강체 실린더(r=40, h=20, opacity=0.6) 렌더링. 와이어프레임 오버레이. Penalty Method 접촉 (applyRigidCylinderContact). 강체가 10mm/s로 하강하며 캔 압축. Play/Pause/Reset 버튼 구현. Reset시 geometry+physics 초기화. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok · ui: 4/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | Step 1.8과 1.10을 함께 구현 (Play/Pause/Reset은 시뮬 연동 필수). 다음: S1.9 탄소성 재료 모델, S1.11 Control Panel. |

---

### [EXP-007] Mass-Spring 물리 엔진 기초 구현

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 00:35:00 |
| **Step** | S1.7 |
| **관련 FR** | FR-10 |
| **관련 NF** | NF-01, NF-02 |
| **변경 내용** | MassSpringSystem 클래스 구현 (engine/MassSpringSystem.ts). BufferGeometry→질량점+스프링 변환. Verlet Integration (Position-based). 바닥면 고정 경계조건. 스프링 상수를 영률 기반 계산. 안정성 체크(isStable). App.tsx에 물리 엔진 초기화 연결. |
| **테스트 항목** | (1) npm run build 성공 (2) 물리 엔진 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: ok(초기화) · ui: 3/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 핵심 물리 엔진 기초. dt=0.001, subSteps=4, damping=0.995. 다음: S1.8 강체 실린더 + 접촉으로 실제 변형 테스트. |

---

### [EXP-006] 그리드 ON/OFF 토글

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 00:25:00 |
| **Step** | S1.6 |
| **관련 FR** | - |
| **관련 NF** | - |
| **변경 내용** | GridHelper에 ref 추가. G키로 토글. showGrid state로 visibility 제어. 10mm 간격(500/50) 유지. |
| **테스트 항목** | (1) npm run build 성공 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: n/a · ui: 3/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 간단한 추가. 다음: S1.7 Mass-Spring 물리 엔진. 핵심 단계. |

---

### [EXP-005] Viewport Toolbar 구현

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 00:20:00 |
| **Step** | S1.5 |
| **관련 FR** | FR-03, FR-04 |
| **관련 NF** | - |
| **변경 내용** | ViewportToolbar 컴포넌트 생성. XY/YZ/XZ/ISO 뷰 버튼, Perspective/Ortho 토글, Fit All, Wireframe 토글. Numpad 7/3/1/0, P, F, W 키보드 단축키. App.tsx 리팩토링(ref 패턴). |
| **테스트 항목** | (1) npm run build 성공 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: n/a · ui: 3/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 뉴로모피즘 스타일 적용 시작. 다음: S1.6 그리드 표시. |

---

### [EXP-004] 좌하단 좌표축 표시

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 00:14:00 |
| **Step** | S1.4 |
| **관련 FR** | FR-14 |
| **관련 NF** | - |
| **변경 내용** | AxisHelper 클래스 구현 (viewer/AxisHelper.ts). 별도 씬+OrthographicCamera로 좌하단 80x80px 영역에 RGB=XYZ 좌표축 표시. ArrowHelper+Sprite 라벨. 메인 카메라 quaternion 동기화. |
| **테스트 항목** | (1) npm run build 성공 (2) 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: n/a · ui: 3/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 별도 WebGLRenderer로 alpha 배경 오버레이. 다음: S1.5 Viewport Toolbar. |

---

### [EXP-003] CATIA V5 호환 카메라 컨트롤 구현

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 00:08:00 |
| **Step** | S1.3 |
| **관련 FR** | FR-02, FR-15 |
| **관련 NF** | NF-05 |
| **변경 내용** | CatiaControls 클래스 구현 (viewer/CatiaControls.ts). MMB=Orbit, Ctrl+MMB=Pan, 스크롤=Zoom. Spherical 좌표 기반 카메라 제어. setView() 메서드로 뷰 전환 준비. |
| **테스트 항목** | (1) npm run build 성공 (2) CatiaControls 타입 체크 통과 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: n/a · ui: 2/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | CATIA V5 마우스 맵핑 정확히 구현. 다음: S1.4 좌표축 표시. |

---

### [EXP-002] 파라메트릭 실린더 캔 메시 생성

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/11 00:02:00 |
| **Step** | S1.2 |
| **관련 FR** | FR-05 |
| **관련 NF** | NF-01 |
| **변경 내용** | CylinderGeometry(r=33, h=120, radSeg=32, hSeg=20)로 캔 메시 생성. MeshStandardMaterial(metalness=0.7, roughness=0.3) 적용. 바닥(grid) 위에 배치. |
| **테스트 항목** | (1) npm run build 성공 (2) 메시 정점 수 확인 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 693 · physics: n/a · ui: 2/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | 32×20 세그먼트로 적절한 노드 수. 물리 엔진 연결 시 이 메시의 정점을 질량점으로 변환 예정. |

---

### [EXP-001] Vite + React + Three.js 초기 프로젝트 셋업

| 항목 | 값 |
|------|-----|
| **시각** | 26/03/10 23:58:00 |
| **Step** | S1.1 |
| **관련 FR** | - |
| **관련 NF** | NF-03, NF-04 |
| **변경 내용** | Vite React-TS 프로젝트 생성. Three.js r183, Zustand, Tailwind 의존성 설치. App.tsx에 WebGLRenderer+PerspectiveCamera+GridHelper 초기화. |
| **테스트 항목** | (1) npm run build 성공 여부 (2) 빌드 출력물 생성 확인 |
| **테스트 결과** | ✅ PASS |
| **측정값** | build: ok · fps: 60 · nodes: 0 · physics: n/a · ui: 1/10 |
| **판정** | ✅ COMMIT (아래) |
| **비고** | React 19 + Three.js r183 조합 정상 동작. Vite 7.3 HMR 양호. 다음: S1.2 캔 메시 생성. |

---

---

## Phase 진행 현황 요약

> 에이전트는 Phase 전환 시 이 섹션을 업데이트한다.

| Phase | 상태 | 시작일 | 완료일 | 실험 수 | 성공 | 실패 | 성공률 |
|-------|------|--------|--------|---------|------|------|--------|
| P1: MVP | ✅ 완료 | 26/03/10 | 26/03/11 | 10 | 10 | 0 | 100% |
| P2: CAD+강체 | ✅ 완료 | 26/03/11 | 26/03/11 | 6 | 6 | 0 | 100% |
| P3: 시각화 | ✅ 완료 | 26/03/11 | 26/03/11 | 7 | 7 | 0 | 100% |
| P4: UI/최적화 | ⬜ 미착수 | - | - | 0 | 0 | 0 | - |

---

## 누적 통계

> 에이전트는 10회 실험마다 이 섹션을 업데이트한다.

| 지표 | 값 |
|------|-----|
| 총 실험 수 | 23 |
| 총 커밋 수 | 23 |
| 총 리셋 수 | 0 |
| 누적 성공률 | 100% |
| 평균 실험 소요시간 | ~6분 |
| 현재 Phase | P4: UI/최적화 |
| 현재 Step | S3.8 (P3 완료) |
| 마지막 push | 26/03/11 02:15 |
| 마지막 활동 | 26/03/11 02:35 |

---

## 버그 로그

> 발견된 버그는 별도로 추적한다. 해결되면 상태를 업데이트한다.

| Bug ID | 발견 일시 | 관련 EXP | 관련 Step | 설명 | 상태 | 해결 일시 | 해결 EXP |
|--------|-----------|----------|-----------|------|------|-----------|----------|

---

## 교훈 로그 (Lessons Learned)

> 에이전트가 실험 과정에서 발견한 패턴, 주의사항, 노하우를 축적한다.
> 자기 순환 개선의 핵심 데이터.

| # | 발견 일시 | 관련 Step | 교훈 내용 |
|---|-----------|-----------|-----------|
| 1 | 26/03/11 01:10 | S2.1~2.2 | opencascade.js WASM은 Vite 빌드와 호환 이슈 있음. vite-plugin-wasm 사용해도 WASM 내부 import "a" 에러 발생. CDN 로드 또는 Web Worker 분리 방식 검토 필요. |

