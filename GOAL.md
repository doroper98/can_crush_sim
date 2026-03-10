# GOAL.md — Can Crush Simulator: Development Target Specification

> **이 파일은 수정하지 않는다.** prepare.py 와 동등한 위치.
> 에이전트와 인간 모두 이 파일을 "목표의 원천(source of truth)"으로 참조한다.
> 변경이 필요하면 CHANGELOG 섹션에 날짜와 사유를 기록한 뒤 수정한다.

---

## 1. 프로젝트 정의

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Can Crush Simulator |
| **한줄 정의** | 알루미늄 캔의 탄소성 변형을 실시간 3D 애니메이션으로 시뮬레이션하는 브라우저 웹앱 |
| **최종 산출물** | React + Three.js SPA (서버 불필요, 정적 호스팅 가능) |
| **성공 기준** | MVP Phase 완료 후 브라우저에서 캔 압축 변형이 시각적으로 재현되는 것 |

---

## 2. 기술 스택 (고정)

| 계층 | 기술 | 비고 |
|------|------|------|
| Frontend | React 18 + TypeScript | SPA |
| 3D Rendering | Three.js r168+ | WebGL 2.0 |
| Physics | Custom Mass-Spring FEM | Elasto-plastic |
| CAD Import | OCCT.js (WASM) | STEP/IGES 파싱 |
| UI System | Tailwind CSS + Custom | Light Neumorphism |
| State | Zustand | 경량 상태관리 |
| Build | Vite | HMR + WASM |

---

## 3. 디자인 시스템 (고정)

### 3.1 컬러

| 역할 | HEX | 용도 |
|------|-----|------|
| Background | #F0F4F8 | 전체 배경 |
| Surface | #FFFFFF | 카드/패널 |
| Primary | #3B82F6 | CTA, 활성 |
| Secondary | #64748B | 보조 텍스트 |
| Accent/Success | #10B981 | 진행/성공 |
| Warning | #F59E0B | 경고 |
| Danger | #EF4444 | 항복초과, 오류 |
| Text Primary | #0F172A | 본문 |

### 3.2 뉴로모피즘 규칙

- **Raised Card**: `box-shadow: 8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.8); border-radius: 16px;`
- **Inset Control**: `box-shadow: inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.9); border-radius: 12px;`
- **Pressed**: `box-shadow: inset 2px 2px 5px rgba(163,177,198,0.5), inset -2px -2px 5px rgba(255,255,255,0.8); transform: scale(0.98);`
- **3D Depth Divider**: 영역 경계에 미세 그라데이션 + 섀도우 조합

---

## 4. 레이아웃 구조 (고정)

```
┌──────────────────────────────────────────────────┐
│  [Viewport Toolbar]                              │
├────────────────────────────┬─────────────────────┤
│                            │  Control Panel      │
│    3D Viewport (70%)       │  (30%)              │
│                            │  - 파일 가져오기     │
│    XYZ축 표시 (좌하단)     │  - 캔 파라미터      │
│    컬러바 (좌측)           │  - 강체 설정        │
│    그리드                  │  - 하중 조건        │
│                            │  - 시뮬레이션 제어   │
│                            │  - 결과 표시        │
│                            │  - 디스플레이 설정   │
├────────────────────────────┴─────────────────────┤
│  [Status Bar: 시뮬상태 | 좌표 | FPS]              │
└──────────────────────────────────────────────────┘
```

---

## 5. Viewport 명세 (고정)

### 5.1 Toolbar 버튼

| 버튼 | 기능 | 단축키 |
|------|------|--------|
| XY | Top View | Num 7 |
| YZ | Right View | Num 3 |
| XZ | Front View | Num 1 |
| ISO | Isometric | Num 0 |
| 입체감 ON/OFF | Perspective ↔ Ortho | P |
| Fit All | 전체 표시 | F |
| 와이어프레임 | 렌더 모드 토글 | W |
| 스크린샷 | PNG 캡처 | - |

### 5.2 마우스 컨트롤 (CATIA V5 호환)

| 조작 | 입력 | 동작 |
|------|------|------|
| Rotate | 중간버튼 드래그 | 카메라 Orbit |
| Pan | 중간버튼 + Ctrl 드래그 | 카메라 평행이동 |
| Zoom | 중간버튼 + Ctrl 스크롤 | 줌 인/아웃 |
| Zoom | 스크롤 휠 | 단계적 줌 |
| Select | 좌클릭 | 객체 선택 |
| Context | 우클릭 | 컨텍스트 메뉴 |

### 5.3 좌표축

- 좌측 하단, 80px 고정, RGB=XYZ, 카메라 동기 회전
- 축 레이블: X, Y, Z 문자 표시

---

## 6. 물리 엔진 명세 (고정)

### 6.1 알고리즘

- Mass-Spring System + Elasto-Plastic Material Model
- 시간 적분: Verlet Integration (Position-based)
- 접촉: Penalty Method (강체-변형체, 자기접촉)
- 경계조건: 바닥면 고정

### 6.2 재료 모델 (Aluminum 기본값)

| 물성 | 기호 | 기본값 | 단위 |
|------|------|--------|------|
| Young's Modulus | E | 69,000 | MPa |
| Poisson's Ratio | ν | 0.33 | - |
| Yield Stress | σ_y | 276 | MPa |
| UTS | σ_u | 310 | MPa |
| Density | ρ | 2,700 | kg/m³ |
| Hardening Exponent | n | 0.2 | - |
| Wall Thickness | t | 0.3 | mm |

가공경화: Ludwik-Hollomon σ = σ_y + K·ε_p^n

### 6.3 강체 (외력 물체)

- 기본형: Cylinder (Rigid Body)
- 파라메트릭: 반지름, 높이, 위치(XYZ), 방향(Euler), Shape Type(Cyl/Box/Sphere/Cone)
- 시각화: 반투명(opacity 0.6), 와이어프레임 오버레이, 하중 화살표

### 6.4 하중 조건

| 파라미터 | 기본 | 범위 |
|----------|------|------|
| 최대하중 | 500N | 0~10,000N |
| 압축속도 | 10mm/s | 1~100mm/s |
| 모드 | Force Control | Force/Displacement |

---

## 7. CAD 임포트 (고정)

| 포맷 | 처리 | 우선순위 |
|------|------|----------|
| STEP (.stp) | OCCT.js WASM | P0 (MVP) |
| STL (.stl) | 직접 메시 로드 | P0 (MVP) |
| IGES (.igs) | OCCT.js | P1 |
| CATProduct | STEP 변환 필요 | P2 |

---

## 8. 기능 요구사항 (FR)

- **FR-01**: STP/STL 파일 드래그&드롭 임포트
- **FR-02**: 3D Viewport 회전/이동/확대축소
- **FR-03**: XY, YZ, XZ 평면뷰 및 ISO 뷰 전환
- **FR-04**: Perspective/Orthographic 토글
- **FR-05**: 캔 형상 파라미터(D, H, t) 슬라이더 수정
- **FR-06**: 알루미늄 물성값 조정
- **FR-07**: 강체 형상 선택 및 치수 조정
- **FR-08**: 강체 위치/방향 3D Gizmo 또는 수치입력 제어
- **FR-09**: 하중 크기(N)와 압축 속도(mm/s) 파라메트릭 제어
- **FR-10**: 시뮬레이션 실행 시 실시간 3D 변형 애니메이션
- **FR-11**: Von Mises 응력 컬러맵 오버레이
- **FR-12**: 하중-변위 그래프 실시간 업데이트
- **FR-13**: 애니메이션 재생/일시정지/초기화/스텝 제어
- **FR-14**: XYZ 좌표축 상시 표시 + 카메라 동기화
- **FR-15**: CATIA 호환 마우스 컨트롤

---

## 9. 비기능 요구사항 (NF)

- **NF-01**: 10,000노드 기준 30fps 이상 렌더링
- **NF-02**: Web Worker로 물리 계산 분리 (UI 블로킹 방지)
- **NF-03**: Chrome 110+, Edge 110+, Firefox 115+ 지원
- **NF-04**: WebGL 2.0 필수, WASM 지원 필수
- **NF-05**: 파라미터 변경 시 100ms 이내 UI 반영
- **NF-06**: 모든 슬라이더에 수치 직접입력 대체 수단
- **NF-07**: 재료 모델 추가 용이한 플러그인 구조
- **NF-08**: 모든 계산 클라이언트 측 실행

---

## 10. 개발 로드맵 (Phase 정의)

| Phase | 명칭 | 산출물 |
|-------|------|--------|
| 1 | MVP - 기본 뷰어 + 변형 엔진 | Three.js Viewport + 실린더 캔 + Mass-Spring 변형 |
| 2 | CAD Import + 강체 제어 | OCCT.js STP 임포트 + 강체 파라메트릭 |
| 3 | 시각화 + 결과 분석 | 응력 컬러맵 + 하중-변위 차트 + 애니메이션 제어 |
| 4 | UI/UX 폴리싱 + 최적화 | 뉴로모피즘 UI + Web Worker + 성능 튜닝 |
| 5 | 확장 기능 | CATProduct 지원 + 추가 재료 + 서버 FEA 연동 |

---

## CHANGELOG

| 날짜 | 변경 사항 | 사유 |
|------|-----------|------|
| 2026-03-10 | v1.0 초기 작성 | SRS 기반 GOAL 문서 생성 |
