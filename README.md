# 3D Architecture Editor

Three.js 기반으로 건축물을 제작하고, 여러 사용자가 실시간으로 공동 편집할 수 있는 웹 기반 3D 건축 에디터입니다.

## 주요 기능

- 건축 오브젝트(플랫폼·벽·바닥·지붕·창문) 배치  
- Grid 및 각도 Snap 기반 건축 도구  
- 편집도구(Gizmo)를 이용한 오브젝트 이동·변형  
- 벽과 창문의 종속 관계 및 개구부 생성  
- 프로젝트별 사용자 초대와 역할 관리, RBAC 기반 협업    
- WebSocket 기반 커서 및 오브젝트 실시간 동기화  
- 오브젝트 단위 Lease Lock을 통한 동시 편집 충돌 방지  

## 기술 스택

### Frontend

- React
- Three.js
- Vite
- CSS2DRenderer
- Lucide React

### Backend

- Java 21
- Spring Boot
- Spring Data JPA
- Spring Security
- WebSocket
- PostgreSQL

## 이벤트 흐름

```text
React UI
   ↓
Three.js Editor
   ↓
WebSocket ── 실시간 커서·오브젝트 변경 전송
   ↓
Spring Boot
   ├─ 인메모리 편집 상태 및 Lease Lock
   └─ PostgreSQL 확정 오브젝트 저장
```

## 주요 설계 포인트  

**실시간 편집 상태와 영속 상태 분리**  
마우스 이동마다 DB를 갱신하면 UPDATE 쿼리와 트랜잭션이 과도하게 발생할 수 있습니다.
따라서 드래그 중 상태는 인메모리 계층에서 관리하고 WebSocket으로 전달하며, 드래그 종료 시 최종 상태만 DB에 반영(영속화)하도록 구성했습니다.
```text
드래그 시작 → 편집 권한 획득
드래그 중   → 인메모리 상태 갱신 및 Broadcast
드래그 종료 → DB 저장 및 편집 권한 해제
```

**오브젝트 단위 동시성 제어**  
프로젝트 전체를 잠그지 않고 `projectId + objectId`를 기준으로 Lease Lock을 적용했습니다. 동일 오브젝트 간의 충돌은 방지하면서 타 오브젝트는 동시에 편집할 수 있습니다.

**기하 데이터 저장 구조 정규화**  
프로젝트의 모든 오브젝트를 하나의 JSON 행에 저장하던 구조를 오브젝트별 행 구조로 정규화. 이를 통해 오브젝트 변경 시 프로젝트 전체 데이터를 갱신하지 않고 독립적으로 저장이 가능해졌습니다.

**벽과 창문의 종속 관계**
벽은 원본 데이터를 유지하고 창문 정보를 벽에 종속해 저장합니다. 프로젝트를 불러올 때 창문 위치를 기준으로 벽을 절편화하여 개구부를 다시 생성합니다.

## 실행 방법

### Backend

```bash
cd backend
./gradlew bootRun
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 개발 현황  

현재 개발 중인 개인 프로젝트입니다. 현재 개발 예정인 기능은 다음과 같습니다:  
Backend: 계층형 편집 권한, 편집 이력 관리(undo 실행하기), 임시 계층 redis 이전  
Frontend: 오브젝트에 건축용 material 적용 및 편집 기능 확대, low-polygon 지형물(나무, 잔디, 꽃) 추가 및 배치    